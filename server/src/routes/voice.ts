import { Router, Request, Response } from 'express';
import https from 'https';

export const voiceRouter = Router();

// GET /api/voice/token
// Calls AssemblyAI agents token endpoint: GET https://agents.assemblyai.com/v1/token?expires_in_seconds=480
voiceRouter.get('/token', async (req: Request, res: Response) => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey || apiKey === 'your_assemblyai_api_key_here') {
    return res.status(503).json({
      error: 'AssemblyAI API key is missing or not configured',
      configured: false,
      message: 'Please set ASSEMBLYAI_API_KEY in server/.env file with your valid AssemblyAI API key.'
    });
  }

  const expiresInSeconds = 480; // 8 minutes token validity window

  try {
    const options = {
      hostname: 'agents.assemblyai.com',
      path: `/v1/token?expires_in_seconds=${expiresInSeconds}`,
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    };

    const tokenPromise = new Promise<{ token: string; expires_in_seconds: number }>((resolve, reject) => {
      const aaiReq = https.request(options, (aaiRes) => {
        let body = '';
        aaiRes.on('data', chunk => body += chunk);
        aaiRes.on('end', () => {
          if (aaiRes.statusCode && aaiRes.statusCode >= 200 && aaiRes.statusCode < 300) {
            try {
              const data = JSON.parse(body);
              resolve(data);
            } catch (err) {
              reject(new Error('Invalid JSON response from AssemblyAI token service'));
            }
          } else {
            reject(new Error(`AssemblyAI token service returned HTTP ${aaiRes.statusCode}: ${body}`));
          }
        });
      });

      aaiReq.on('error', (err) => {
        reject(err);
      });

      aaiReq.end();
    });

    const tokenData = await tokenPromise;

    return res.status(200).json({
      token: tokenData.token,
      expires_in_seconds: tokenData.expires_in_seconds,
      ws_url: 'wss://agents.assemblyai.com/v1/ws',
      configured: true
    });
  } catch (err: any) {
    console.error('Error generating AssemblyAI temporary token:', err.message);
    return res.status(502).json({
      error: 'Failed to generate AssemblyAI temporary token',
      message: 'Upstream voice agent authentication service error. Please verify your AssemblyAI account tier and network connectivity.',
      configured: true
    });
  }
});
