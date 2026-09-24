import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { voiceRouter } from './routes/voice.js';
import { incidentsRouter } from './routes/incidents.js';
import { dbGet } from './db/database.js';

dotenv.config();

export const app = express();
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // Allow WebSocket and external API communication
}));

// CORS setup
app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

// Mount Routes
app.use('/api/voice', voiceRouter);
app.use('/api/incidents', incidentsRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🛡️  CyberVoice AI Backend running on port ${port}`);
    console.log(`📡 AssemblyAI Voice integration endpoint ready at /api/voice/token`);
  });
}
