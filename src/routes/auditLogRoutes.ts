import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Protected Superadmin & Editor audit log inspection
router.get('/', authenticateToken, requireRole(['superadmin', 'editor']), getAuditLogs);

export default router;
