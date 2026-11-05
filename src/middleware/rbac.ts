import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function requireRole(allowedRoles: Array<'superadmin' | 'editor'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
      });
      return;
    }

    next();
  };
}
