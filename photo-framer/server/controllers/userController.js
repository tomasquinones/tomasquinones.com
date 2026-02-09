import { query, queryOne } from '../config/database.js';
import { hashPassword, validatePassword } from './authController.js';

// Input length limits
const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  EMAIL_MAX: 254 // RFC 5321
};

function validateUsername(username) {
  if (!username || username.length < LIMITS.USERNAME_MIN) {
    return `Username must be at least ${LIMITS.USERNAME_MIN} characters`;
  }
  if (username.length > LIMITS.USERNAME_MAX) {
    return `Username must be ${LIMITS.USERNAME_MAX} characters or less`;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  return null;
}

function validateEmail(email) {
  if (!email || email.length > LIMITS.EMAIL_MAX) {
    return `Email must be ${LIMITS.EMAIL_MAX} characters or less`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

export async function listUsers(req, res, next) {
  try {
    const users = await query(
      `SELECT id, username, email, role, is_active, created_at, last_login
       FROM users ORDER BY created_at DESC`
    );

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await queryOne(
      `SELECT id, username, email, role, is_active, created_at, last_login
       FROM users WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { username, email, password, role = 'viewer' } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    // Validate username format and length
    const usernameError = validateUsername(username);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }

    // Validate email format and length
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Validate role
    if (!['admin', 'contributor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check for existing user
    const existing = await queryOne(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email.toLowerCase(), username]
    );

    if (existing) {
      return res.status(409).json({
        error: 'A user with this email or username already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [username, email.toLowerCase(), passwordHash, role]
    );

    const user = await queryOne(
      `SELECT id, username, email, role, is_active, created_at
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    // Validate inputs if provided
    if (username) {
      const usernameError = validateUsername(username);
      if (usernameError) {
        return res.status(400).json({ error: usernameError });
      }
    }

    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return res.status(400).json({ error: emailError });
      }
    }

    const user = await queryOne('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (username && username !== user.username) {
      // Check username not taken
      const existing = await queryOne(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      updates.push('username = ?');
      values.push(username);
    }

    if (email && email.toLowerCase() !== user.email) {
      // Check email not taken
      const existing = await queryOne(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email.toLowerCase(), id]
      );
      if (existing) {
        return res.status(409).json({ error: 'Email already taken' });
      }
      updates.push('email = ?');
      values.push(email.toLowerCase());
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updatedUser = await queryOne(
      `SELECT id, username, email, role, is_active, created_at
       FROM users WHERE id = ?`,
      [id]
    );

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function deactivateUser(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent self-deactivation
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate yourself' });
    }

    const user = await queryOne('SELECT id FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Deactivate user
    await query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);

    // Invalidate all sessions
    await query('UPDATE sessions SET is_valid = FALSE WHERE user_id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function changeRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['admin', 'contributor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent self role change
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await queryOne('SELECT id FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    res.json({ success: true, role });
  } catch (error) {
    next(error);
  }
}
