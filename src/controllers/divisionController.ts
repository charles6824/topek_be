import { Request, Response } from 'express';
import { Division } from '../models/Division.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getDivisions(_req: Request, res: Response): Promise<void> {
  const divisions = await Division.find().sort({ number: 1 });
  res.json({
    success: true,
    count: divisions.length,
    data: divisions,
  });
}

export async function getDivisionBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;
  const division = await Division.findOne({ slug });

  if (!division) {
    res.status(404).json({ success: false, message: 'Division not found' });
    return;
  }

  res.json({ success: true, data: division });
}

export async function updateDivision(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const division = await Division.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!division) {
    res.status(404).json({ success: false, message: 'Division not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'DIVISION_UPDATED',
      resource: 'Division',
      resourceId: division._id.toString(),
      details: { title: division.title },
    });
  }

  res.json({
    success: true,
    message: 'Division updated successfully',
    data: division,
  });
}
