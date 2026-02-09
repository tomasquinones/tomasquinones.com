import { queryOne } from '../config/database.js';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/albums',
  '/api/health',
  '/api/photos/thumb'
];

const PUBLIC_PATTERNS = [
  /^\/api\/albums\/[^/]+$/, // GET single album by slug
];

export async function sessionMiddleware(req, res, next) {
  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some(route => req.path.startsWith(route)) ||
    PUBLIC_PATTERNS.some(pattern => pattern.test(req.path) && req.method === 'GET');

  // Get session token from cookie only (not headers, to preserve SameSite protection)
  const sessionId = req.cookies?.session_id;

  if (sessionId) {
    try {
      const session = await queryOne(
        `SELECT s.*, u.id as user_id, u.username, u.email, u.role, u.is_active
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ? AND s.is_valid = TRUE AND s.expires_at > NOW()`,
        [sessionId]
      );

      if (session && session.is_active) {
        req.user = {
          id: session.user_id,
          username: session.username,
          email: session.email,
          role: session.role
        };
        req.sessionId = sessionId;

        // Extend session on activity (sliding expiration)
        await queryOne(
          `UPDATE sessions SET expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
           WHERE id = ?`,
          [sessionId]
        );
      }
    } catch (error) {
      console.error('Session validation error:', error);
    }
  }

  // Allow public routes without authentication
  if (isPublic) {
    return next();
  }

  // Require authentication for non-public routes
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

export function requireContributor(req, res, next) {
  return requireRole('admin', 'contributor')(req, res, next);
}
