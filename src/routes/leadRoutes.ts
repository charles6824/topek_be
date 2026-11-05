import { Router } from 'express';
import {
  submitLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
  leadSchema,
} from '../controllers/leadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { leadSubmissionLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public submission with anti-spam limiter & schema validation
router.post('/', leadSubmissionLimiter, validateBody(leadSchema), submitLead);

// Protected Admin leads inbox
router.get('/', authenticateToken, requireRole(['superadmin', 'editor']), getLeads);
router.put('/:id', authenticateToken, requireRole(['superadmin', 'editor']), updateLeadStatus);
router.delete('/:id', authenticateToken, requireRole(['superadmin']), deleteLead);

export default router;
