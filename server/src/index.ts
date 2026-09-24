import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config();

import { voiceRouter } from './routes/voice.js';
import { incidentsRouter } from './routes/incidents.js';
import { dbGet } from './db/database.js';

export const app = express();
const port = Number(process.env.PORT) || 5000;
const host = '0.0.0.0';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allow WebSocket and external API communication
}));

// CORS setup (Support same-origin, configured frontend URL, and local dev)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin browser requests)
    if (!origin) return callback(null, true);
    if (
      origin === frontendUrl ||
      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173' ||
      origin.endsWith('.replit.dev') ||
      origin.endsWith('.replit.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for single-domain deployment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);
app.use(express.json({ limit: '1mb' }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'healthy';
  try {
    await dbGet('SELECT 1');
  } catch (err) {
    dbStatus = 'unhealthy';
  }

  const aaiKey = process.env.ASSEMBLYAI_API_KEY;
  const aaiConfigured = Boolean(aaiKey && aaiKey !== 'your_assemblyai_api_key_here');

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CyberVoice AI API',
    database: dbStatus,
    assemblyai: {
      configured: aaiConfigured
    }
  });
});

// Mount API Routes
app.use('/api/voice', voiceRouter);
app.use('/api/incidents', incidentsRouter);

// Unknown API routes return 404 JSON instead of HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Frontend static serving and SPA fallback
// Check candidate locations for client build:
// 1. ../../client/dist (when running from server/dist or server/src)
// 2. ../client/dist (when running from repo root or server root)
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist')
];

let clientDistPath: string | null = null;
for (const candidate of clientDistCandidates) {
  if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'index.html'))) {
    clientDistPath = candidate;
    break;
  }
}

if (clientDistPath) {
  console.log(`📦 Serving frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
} else {
  console.log('ℹ️  Frontend build directory (client/dist) not found. Running in API-only mode.');
  app.get('/', (req, res) => {
    res.send({
      message: 'CyberVoice AI Backend API is active. Build the frontend with `npm run build` to serve the full UI.'
    });
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, host, () => {
    console.log(`🛡️  CyberVoice AI Server running on http://${host}:${port}`);
    console.log(`📡 AssemblyAI Voice integration endpoint ready at /api/voice/token`);
  });
}
