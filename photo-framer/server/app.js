import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import albumRoutes from './routes/albums.js';
import photoRoutes from './routes/photos.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sessionMiddleware } from './middleware/auth.js';
import { hotlinkProtection } from './middleware/hotlinkProtection.js';
import { blockBadBots } from './middleware/blockBadBots.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  referrerPolicy: { policy: 'same-origin' }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

// Cookie parser (must be before session middleware)
app.use(cookieParser());

// Global rate limiting (relaxed in development)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later' });
  }
});

app.use(globalLimiter);

// Block bad bots
app.use(blockBadBots);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Session validation for protected routes
app.use(sessionMiddleware);

// Hotlink protection for photos
app.use('/photos', hotlinkProtection);

// Serve thumbnails statically with protection (under /api for Vite proxy)
app.use('/api/photos/thumb', express.static(
  path.join(__dirname, '../uploads/thumbnails'),
  { maxAge: '1y' }
));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Photo-Framer API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
