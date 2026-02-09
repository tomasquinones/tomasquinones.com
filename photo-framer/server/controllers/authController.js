import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, queryOne } from '../config/database.js';

const BCRYPT_ROUNDS = 12;
const SESSION_DURATION_HOURS = 24;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Honeypot check
    if (req.body._honeypot) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // Generic error message to prevent user enumeration
    const genericError = 'Invalid email or password';

    if (!user) {
      return res.status(401).json({ error: genericError });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until) - new Date()) / 60000
      );
      return res.status(423).json({
        error: `Account locked. Try again in ${remainingMinutes} minutes.`
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ error: genericError });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      // Increment failed attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil = null;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
      }

      await query(
        `UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`,
        [newAttempts, lockUntil, user.id]
      );

      return res.status(401).json({ error: genericError });
    }

    // Reset failed attempts on successful login
    await query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?`,
      [user.id]
    );

    // Create session
    const sessionId = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

    await query(
      `INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, user.id, req.ip, req.get('User-Agent') || '', expiresAt]
    );

    // Set session cookie
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      expires: expiresAt,
      path: '/'
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const sessionId = req.cookies?.session_id;

    if (sessionId) {
      await query(
        'UPDATE sessions SET is_valid = FALSE WHERE id = ?',
        [sessionId]
      );
    }

    res.clearCookie('session_id');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
}

// Helper function to hash password (used by user creation)
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Password validation
export function validatePassword(password) {
  if (password.length < 12) {
    return 'Password must be at least 12 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}
