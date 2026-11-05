import { Router } from 'express';
import {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  equipmentSchema,
} from '../controllers/equipmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public route
router.get('/', getEquipment);

// Protected Admin routes
router.post(
  '/',
  authenticateToken,
  requireRole(['superadmin', 'editor']),
  validateBody(equipmentSchema),
  createEquipment
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(['superadmin', 'editor']),
  updateEquipment
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(['superadmin']),
  deleteEquipment
);

export default router;
