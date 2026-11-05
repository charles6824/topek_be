import { Request, Response } from 'express';
import { z } from 'zod';
import { Lead } from '../models/Lead.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export const leadSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Phone number must be at least 7 characters').max(30),
  organization: z.string().max(150).optional(),
  divisionInterest: z.string().optional(),
  projectScope: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
});

function sanitizeInput(str?: string): string {
  if (!str) return '';
  // Neutralize spreadsheet formula injection prefixes (=, +, -, @)
  let clean = str.replace(/^[=+\-@\t\r]+/g, "'");
  // Escape HTML entities to prevent stored XSS
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return clean.trim();
}

export async function submitLead(req: Request, res: Response): Promise<void> {
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
  const { fullName, email, phone, organization, divisionInterest, projectScope, budget, message } = req.body;

  const lead = await Lead.create({
    fullName: sanitizeInput(fullName),
    email: typeof email === 'string' ? email.trim().toLowerCase() : email,
    phone: sanitizeInput(phone),
    organization: organization ? sanitizeInput(organization) : undefined,
    divisionInterest: divisionInterest ? sanitizeInput(divisionInterest) : undefined,
    projectScope: projectScope ? sanitizeInput(projectScope) : undefined,
    budget: budget ? sanitizeInput(budget) : undefined,
    message: sanitizeInput(message),
    ipAddress,
  });

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been received. Our project engineering team will contact you shortly.',
    leadId: lead._id,
  });
}

export async function getLeads(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.query;
  const query: Record<string, unknown> = {};

  if (status && ['New', 'In-Review', 'Contacted', 'Closed'].includes(status as string)) {
    query.status = status;
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: leads.length,
    data: leads,
  });
}

export async function updateLeadStatus(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, notes } = req.body;

  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes: sanitizeInput(notes) } : {}),
    },
    { new: true }
  );

  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'LEAD_STATUS_UPDATED',
      resource: 'Lead',
      resourceId: lead._id.toString(),
      details: { newStatus: status, leadName: lead.fullName },
    });
  }

  res.json({
    success: true,
    message: 'Lead updated successfully',
    data: lead,
  });
}

export async function deleteLead(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const lead = await Lead.findByIdAndDelete(id);

  if (!lead) {
    res.status(404).json({ success: false, message: 'Lead not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'LEAD_DELETED',
      resource: 'Lead',
      resourceId: lead._id.toString(),
      details: { leadName: lead.fullName },
    });
  }

  res.json({
    success: true,
    message: 'Lead deleted successfully',
  });
}
