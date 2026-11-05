import { Request, Response } from 'express';
import { z } from 'zod';
import { Equipment } from '../models/Equipment.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export const equipmentSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['Earthmoving', 'Lifting & Cranes', 'Concrete & Paving', 'Haulage & Logistics', 'Survey & Testing', 'Power & Welding']),
  quantity: z.string().min(1),
  specifications: z.string().min(3),
  status: z.enum(['Operational', 'Mobilized', 'Under Maintenance']).optional(),
  order: z.number().optional(),
});

export async function getEquipment(req: Request, res: Response): Promise<void> {
  const { category, status } = req.query;
  const query: Record<string, unknown> = {};

  if (category) query.category = category;
  if (status) query.status = status;

  const equipment = await Equipment.find(query).sort({ order: 1, createdAt: 1 });
  res.json({
    success: true,
    count: equipment.length,
    data: equipment,
  });
}

export async function createEquipment(req: AuthRequest, res: Response): Promise<void> {
  const item = await Equipment.create(req.body);

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'EQUIPMENT_CREATED',
      resource: 'Equipment',
      resourceId: item._id.toString(),
      details: { name: item.name },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Equipment added successfully',
    data: item,
  });
}

export async function updateEquipment(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const item = await Equipment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    res.status(404).json({ success: false, message: 'Equipment not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'EQUIPMENT_UPDATED',
      resource: 'Equipment',
      resourceId: item._id.toString(),
      details: { name: item.name },
    });
  }

  res.json({
    success: true,
    message: 'Equipment updated successfully',
    data: item,
  });
}

export async function deleteEquipment(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const item = await Equipment.findByIdAndDelete(id);

  if (!item) {
    res.status(404).json({ success: false, message: 'Equipment not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'EQUIPMENT_DELETED',
      resource: 'Equipment',
      resourceId: item._id.toString(),
      details: { name: item.name },
    });
  }

  res.json({
    success: true,
    message: 'Equipment deleted successfully',
  });
}
