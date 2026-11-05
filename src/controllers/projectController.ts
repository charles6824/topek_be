import { Request, Response } from 'express';
import { z } from 'zod';
import { Project } from '../models/Project.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export const projectSchema = z.object({
  title: z.string().min(3).max(200),
  client: z.string().min(2).max(150),
  scope: z.string().min(5),
  location: z.string().min(2).max(120),
  year: z.string().optional(),
  status: z.enum(['Ongoing', 'Completed']),
  category: z.enum(['civil-infrastructure', 'gas-energy', 'industrial-commercial', 'specialized']),
  division: z.string().optional(),
  featured: z.boolean().optional(),
  mainImage: z.string().min(1),
  galleryImages: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export async function getProjects(req: Request, res: Response): Promise<void> {
  const { status, category, featured } = req.query;

  const query: Record<string, unknown> = {};
  if (status && (status === 'Ongoing' || status === 'Completed')) {
    query.status = status;
  }
  if (category) {
    query.category = category;
  }
  if (featured !== undefined) {
    query.featured = featured === 'true';
  }

  const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

  res.json({
    success: true,
    count: projects.length,
    data: projects,
  });
}

export async function getProjectById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }

  res.json({ success: true, data: project });
}

export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  const projectData = req.body;
  const project = await Project.create(projectData);

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'PROJECT_CREATED',
      resource: 'Project',
      resourceId: project._id.toString(),
      details: { title: project.title, client: project.client },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
}

export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const project = await Project.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'PROJECT_UPDATED',
      resource: 'Project',
      resourceId: project._id.toString(),
      details: { updatedFields: Object.keys(req.body) },
    });
  }

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
}

export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found' });
    return;
  }

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'PROJECT_DELETED',
      resource: 'Project',
      resourceId: project._id.toString(),
      details: { title: project.title },
    });
  }

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
}
