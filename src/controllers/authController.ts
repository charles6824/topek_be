import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthRequest } from '../middleware/auth.js';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  // Check if locked
  if (user.isLocked()) {
    const remainingMinutes = Math.ceil(
      ((user.lockUntil?.getTime() || 0) - Date.now()) / (60 * 1000)
    );
    res.status(423).json({
      success: false,
      message: `Account is temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minute(s).`,
    });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  await user.resetLoginAttempts();

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing.');
  }
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '1d' }
  );

  // Set HttpOnly cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('topek_admin_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Log audit action
  await AuditLog.create({
    userId: user._id.toString(),
    userEmail: user.email,
    action: 'USER_LOGIN',
    resource: 'Auth',
    ipAddress,
    userAgent,
    details: { loginAt: new Date() },
  });

  res.json({
    success: true,
    message: 'Login successful',
    token, // Also provided for Authorization header if desired
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

  if (req.user) {
    await AuditLog.create({
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      action: 'USER_LOGOUT',
      resource: 'Auth',
      ipAddress,
      details: { logoutAt: new Date() },
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('topek_admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
    },
  });
}

export async function setupInitialAdmin(req: Request, res: Response): Promise<void> {
  const count = await User.countDocuments();
  if (count > 0) {
    res.status(400).json({
      success: false,
      message: 'Setup has already been completed. Admin accounts exist.',
    });
    return;
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) {
    res.status(400).json({
      success: false,
      message: 'Name, email, and a secure password (min 8 chars) are required.',
    });
    return;
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const newAdmin = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'superadmin',
  });

  await AuditLog.create({
    userId: newAdmin._id.toString(),
    userEmail: newAdmin.email,
    action: 'INITIAL_ADMIN_SETUP',
    resource: 'User',
    details: { initialAdmin: true },
  });

  res.status(201).json({
    success: true,
    message: 'Initial superadmin created successfully.',
    admin: {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
}
