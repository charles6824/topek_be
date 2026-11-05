import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  projectSchema,
} from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected Admin routes
router.post(
  '/',
  authenticateToken,
  requireRole(['superadmin', 'editor']),
  validateBody(projectSchema),
  createProject
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(['superadmin', 'editor']),
  updateProject
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(['superadmin']),
  deleteProject
);

export default router;
