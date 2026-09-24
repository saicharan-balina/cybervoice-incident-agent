import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('CyberVoice AI Backend API Tests', () => {
  it('GET /api/health should return 200 with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('healthy');
    expect(res.body.assemblyai).toHaveProperty('configured');
  });

  it('GET /api/voice/token should return temporary token without revealing permanent key', async () => {
    const res = await request(app).get('/api/voice/token');
    // If key is configured, expect 200 with token and ws_url
    if (res.body.configured) {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.ws_url).toBe('wss://agents.assemblyai.com/v1/ws');
      // Ensure the permanent API key is NOT returned in plaintext
      expect(res.body.token).not.toBe(process.env.ASSEMBLYAI_API_KEY);
    }
  });

  let createdId = '';

  it('POST /api/incidents should validate input and reject invalid payload', async () => {
    const res = await request(app).post('/api/incidents').send({
      incidentType: 'invalid_type',
      title: 'Hi'
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid incident payload');
  });

  it('POST /api/incidents should successfully create an incident report', async () => {
    const res = await request(app).post('/api/incidents').send({
      incidentType: 'phishing_email',
      title: 'Suspicious Bank Account Closure SMS',
      description: 'User received text claiming account would be blocked and clicked the provided verification link.',
      suspiciousUrl: 'https://security-verify-bank.fake',
      clickedLink: true,
      sharedCredentials: false,
      sharedFinancialInformation: false,
      openedAttachment: false,
      urgency: 'high',
      status: 'new',
      timeline: [
        { time: '10:00 AM', event: 'Received urgent SMS warning', category: 'reported_event', verified: true },
        { time: '10:02 AM', event: 'Clicked login link in SMS', category: 'user_action', verified: true }
      ],
      recommendedActions: [
        { action: 'Do not submit credentials or OTP', priority: 'immediate' },
        { action: 'Contact bank through official phone number', priority: 'high' }
      ]
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^inc_/);
    expect(res.body.title).toBe('Suspicious Bank Account Closure SMS');
    expect(res.body.clickedLink).toBe(true);
    createdId = res.body.id;
  });

  it('GET /api/incidents should retrieve list and compute real stats', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.incidents)).toBe(true);
    expect(res.body.stats.total).toBeGreaterThanOrEqual(1);
    expect(res.body.stats).toHaveProperty('new');
    expect(res.body.stats).toHaveProperty('highUrgency');
  });

  it('GET /api/incidents/:id should retrieve details', async () => {
    const res = await request(app).get(`/api/incidents/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.incidentType).toBe('phishing_email');
    expect(res.body.timeline.length).toBe(2);
  });

  it('PATCH /api/incidents/:id should update incident status and fields', async () => {
    const res = await request(app).patch(`/api/incidents/${createdId}`).send({
      status: 'reviewing',
      urgency: 'critical'
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('reviewing');
    expect(res.body.urgency).toBe('critical');
  });

  it('DELETE /api/incidents/:id should delete incident report', async () => {
    const res = await request(app).delete(`/api/incidents/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);

    const getRes = await request(app).get(`/api/incidents/${createdId}`);
    expect(getRes.status).toBe(404);
  });
});
