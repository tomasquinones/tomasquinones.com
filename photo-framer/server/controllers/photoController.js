import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';
import { query, queryOne } from '../config/database.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getImageTokenSecret() {
  const secret = process.env.getImageTokenSecret();
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('getImageTokenSecret() must be set in production');
  }
  return secret || 'dev-only-secret-do-not-use-in-production';
}
const TOKEN_EXPIRY = '5m'; // 5 minutes

// Input length limits
const LIMITS = {
  TITLE_MAX: 200,
  CAPTION_MAX: 2000,
  ALT_TEXT_MAX: 500
};

function validateLength(value, maxLength, fieldName) {
  if (value && value.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  return null;
}

export async function getPhoto(req, res, next) {
  try {
    const { id } = req.params;

    const photo = await queryOne(
      `SELECT p.*, a.visibility, a.owner_id
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`,
      [id]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check visibility
    if (photo.visibility === 'private') {
      if (!req.user || (req.user.id !== photo.owner_id && req.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Increment view count
    await query('UPDATE photos SET view_count = view_count + 1 WHERE id = ?', [id]);

    // Remove sensitive data
    delete photo.file_path;
    delete photo.visibility;
    delete photo.owner_id;

    res.json({ photo });
  } catch (error) {
    next(error);
  }
}

export async function getFullResToken(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const photo = await queryOne(
      `SELECT p.*, a.visibility, a.owner_id
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`,
      [id]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check visibility
    if (photo.visibility === 'private') {
      if (req.user.id !== photo.owner_id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Generate time-limited token
    const token = jwt.sign(
      {
        photoId: photo.id,
        filename: photo.filename,
        userId: req.user.id
      },
      getImageTokenSecret(),
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
}

export async function serveFullRes(req, res, next) {
  try {
    const { token, filename } = req.params;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, getImageTokenSecret());
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify filename matches
    if (decoded.filename !== filename) {
      return res.status(403).json({ error: 'Token does not match file' });
    }

    // Get photo path
    const photo = await queryOne(
      'SELECT file_path, mime_type FROM photos WHERE id = ?',
      [decoded.photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if file exists
    try {
      await fs.access(photo.file_path);
    } catch (err) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set headers to prevent caching of token URLs
    res.set({
      'Content-Type': photo.mime_type,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Stream file
    res.sendFile(photo.file_path);
  } catch (error) {
    next(error);
  }
}

export async function updatePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const { title, caption, alt_text } = req.body;

    // Validate input lengths
    const titleError = validateLength(title, LIMITS.TITLE_MAX, 'Title');
    if (titleError) return res.status(400).json({ error: titleError });

    const captionError = validateLength(caption, LIMITS.CAPTION_MAX, 'Caption');
    if (captionError) return res.status(400).json({ error: captionError });

    const altError = validateLength(alt_text, LIMITS.ALT_TEXT_MAX, 'Alt text');
    if (altError) return res.status(400).json({ error: altError });

    const photo = await queryOne(
      `SELECT p.*, a.owner_id
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`,
      [id]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check ownership
    if (photo.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (caption !== undefined) {
      updates.push('caption = ?');
      values.push(caption);
    }
    if (alt_text !== undefined) {
      updates.push('alt_text = ?');
      values.push(alt_text);
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE photos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updatedPhoto = await queryOne('SELECT * FROM photos WHERE id = ?', [id]);

    res.json({ photo: updatedPhoto });
  } catch (error) {
    next(error);
  }
}

export async function deletePhoto(req, res, next) {
  try {
    const { id } = req.params;

    const photo = await queryOne(
      `SELECT p.*, a.owner_id, a.cover_photo_id
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`,
      [id]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check ownership
    if (photo.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete files
    try {
      await fs.unlink(photo.file_path);
      await fs.unlink(photo.thumbnail_path);
    } catch (err) {
      console.error('Failed to delete photo files:', err);
    }

    // If this was the cover photo, set a new one
    if (photo.cover_photo_id === photo.id) {
      const newCover = await queryOne(
        'SELECT id FROM photos WHERE album_id = ? AND id != ? LIMIT 1',
        [photo.album_id, id]
      );
      await query(
        'UPDATE albums SET cover_photo_id = ? WHERE id = ?',
        [newCover?.id || null, photo.album_id]
      );
    }

    // Delete from database
    await query('DELETE FROM photos WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
