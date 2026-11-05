import { Response } from 'express';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);

  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
}
