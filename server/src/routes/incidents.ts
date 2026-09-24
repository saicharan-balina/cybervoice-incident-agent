import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../db/database.js';
import {
  CreateIncidentSchema,
  UpdateIncidentSchema,
  IncidentRecord
} from '../db/schema.js';

export const incidentsRouter = Router();

// Helper to sanitize row from DB
function mapRowToIncident(row: any): IncidentRecord {
  return {
    id: row.id,
    incidentType: row.incidentType,
    title: row.title,
    description: row.description,
    source: row.source,
    suspiciousUrl: row.suspiciousUrl,
    clickedLink: Boolean(row.clickedLink),
    sharedCredentials: Boolean(row.sharedCredentials),
    sharedFinancialInformation: Boolean(row.sharedFinancialInformation),
    openedAttachment: Boolean(row.openedAttachment),
    urgency: row.urgency,
    status: row.status,
    conversationId: row.conversationId,
    timeline: row.timeline ? JSON.parse(row.timeline) : [],
    recommendedActions: row.recommendedActions ? JSON.parse(row.recommendedActions) : [],
    metadata: row.metadata ? JSON.parse(row.metadata) : {},
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

// GET /api/incidents
incidentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { status, urgency, incidentType, search, sort = 'desc' } = req.query;

    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params: any[] = [];

    if (status && typeof status === 'string') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (urgency && typeof urgency === 'string') {
      query += ' AND urgency = ?';
      params.push(urgency);
    }

    if (incidentType && typeof incidentType === 'string') {
      query += ' AND incidentType = ?';
      params.push(incidentType);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      query += ' AND (title LIKE ? OR description LIKE ? OR suspiciousUrl LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const sortDirection = sort === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY createdAt ${sortDirection} LIMIT 100`;

    const rows = await dbAll(query, params);
    const incidents = rows.map(mapRowToIncident);

    // Compute stats dynamically from the actual DB records
    const statsRows = await dbAll<{ status: string; urgency: string; count: number }>(`
      SELECT status, urgency, COUNT(*) as count FROM incidents GROUP BY status, urgency
    `);

    let total = 0;
    let newCount = 0;
    let reviewingCount = 0;
    let resolvedCount = 0;
    let highUrgencyCount = 0;

    for (const r of statsRows) {
      total += r.count;
      if (r.status === 'new') newCount += r.count;
      if (r.status === 'reviewing') reviewingCount += r.count;
      if (r.status === 'resolved') resolvedCount += r.count;
      if (r.urgency === 'high' || r.urgency === 'critical') highUrgencyCount += r.count;
    }

    return res.status(200).json({
      incidents,
      stats: {
        total,
        new: newCount,
        reviewing: reviewingCount,
        resolved: resolvedCount,
        highUrgency: highUrgencyCount
      }
    });
  } catch (err: any) {
    console.error('Error fetching incidents:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve incidents from database' });
  }
});

// GET /api/incidents/:id
incidentsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await dbGet('SELECT * FROM incidents WHERE id = ?', [id]);

    if (!row) {
      return res.status(404).json({ error: 'Incident report not found' });
    }

    return res.status(200).json(mapRowToIncident(row));
  } catch (err: any) {
    console.error('Error fetching incident by id:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve incident details' });
  }
});

// POST /api/incidents
incidentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const parseResult = CreateIncidentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid incident payload',
        details: parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }

    const data = parseResult.data;
    const id = `inc_${randomUUID().slice(0, 12)}`;
    const now = new Date().toISOString();

    await dbRun(`
      INSERT INTO incidents (
        id, incidentType, title, description, source, suspiciousUrl,
        clickedLink, sharedCredentials, sharedFinancialInformation, openedAttachment,
        urgency, status, conversationId, timeline, recommendedActions, metadata,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      data.incidentType,
      data.title,
      data.description,
      data.source,
      data.suspiciousUrl || null,
      data.clickedLink ? 1 : 0,
      data.sharedCredentials ? 1 : 0,
      data.sharedFinancialInformation ? 1 : 0,
      data.openedAttachment ? 1 : 0,
      data.urgency,
      data.status,
      data.conversationId || null,
      JSON.stringify(data.timeline || []),
      JSON.stringify(data.recommendedActions || []),
      JSON.stringify(data.metadata || {}),
      now,
      now
    ]);

    const created = await dbGet('SELECT * FROM incidents WHERE id = ?', [id]);
    return res.status(201).json(mapRowToIncident(created));
  } catch (err: any) {
    console.error('Error creating incident:', err.message);
    return res.status(500).json({ error: 'Failed to save incident report' });
  }
});

// PATCH /api/incidents/:id
incidentsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = UpdateIncidentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid update payload',
        details: parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }

    const existing = await dbGet('SELECT * FROM incidents WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Incident report not found' });
    }

    const data = parseResult.data;
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) { updates.push('title = ?'); params.push(data.title); }
    if (data.incidentType !== undefined) { updates.push('incidentType = ?'); params.push(data.incidentType); }
    if (data.description !== undefined) { updates.push('description = ?'); params.push(data.description); }
    if (data.suspiciousUrl !== undefined) { updates.push('suspiciousUrl = ?'); params.push(data.suspiciousUrl); }
    if (data.clickedLink !== undefined) { updates.push('clickedLink = ?'); params.push(data.clickedLink ? 1 : 0); }
    if (data.sharedCredentials !== undefined) { updates.push('sharedCredentials = ?'); params.push(data.sharedCredentials ? 1 : 0); }
    if (data.sharedFinancialInformation !== undefined) { updates.push('sharedFinancialInformation = ?'); params.push(data.sharedFinancialInformation ? 1 : 0); }
    if (data.openedAttachment !== undefined) { updates.push('openedAttachment = ?'); params.push(data.openedAttachment ? 1 : 0); }
    if (data.urgency !== undefined) { updates.push('urgency = ?'); params.push(data.urgency); }
    if (data.status !== undefined) { updates.push('status = ?'); params.push(data.status); }
    if (data.timeline !== undefined) { updates.push('timeline = ?'); params.push(JSON.stringify(data.timeline)); }
    if (data.recommendedActions !== undefined) { updates.push('recommendedActions = ?'); params.push(JSON.stringify(data.recommendedActions)); }
    if (data.metadata !== undefined) { updates.push('metadata = ?'); params.push(JSON.stringify(data.metadata)); }

    const now = new Date().toISOString();
    updates.push('updatedAt = ?');
    params.push(now);

    params.push(id);

    await dbRun(`UPDATE incidents SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await dbGet('SELECT * FROM incidents WHERE id = ?', [id]);
    return res.status(200).json(mapRowToIncident(updated));
  } catch (err: any) {
    console.error('Error updating incident:', err.message);
    return res.status(500).json({ error: 'Failed to update incident report' });
  }
});

// DELETE /api/incidents/:id
incidentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM incidents WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Incident report not found' });
    }

    await dbRun('DELETE FROM incidents WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Incident report deleted successfully', id });
  } catch (err: any) {
    console.error('Error deleting incident:', err.message);
    return res.status(500).json({ error: 'Failed to delete incident report' });
  }
});
