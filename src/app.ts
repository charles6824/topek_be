import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import divisionRoutes from './routes/divisionRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Application = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const rawOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : [];

const defaultOrigins = [
  'https://topekfe-five.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const allowedOrigins = Array.from(new Set([...rawOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      // Automatically permit Vercel preview & production deployments
      if (/^https:\/\/.*\.vercel\.app\/?$/.test(origin)) return callback(null, true);
      return callback(new Error(`Blocked by CORS security policy: ${origin}`));
    },
    credentials: true,
  })
);

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'TOPEK Construction Limited API',
    cac: 'RC 1946874',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
