import { Router } from 'express';
import {
  getDivisions,
  getDivisionBySlug,
  updateDivision,
} from '../controllers/divisionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Public routes
router.get('/', getDivisions);
router.get('/:slug', getDivisionBySlug);

// Protected Admin update
router.put(
  '/:id',
  authenticateToken,
  requireRole(['superadmin', 'editor']),
  updateDivision
);

export default router;
