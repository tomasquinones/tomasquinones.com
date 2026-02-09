import { query, queryOne } from '../config/database.js';
import { processImage } from '../services/imageProcessor.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input length limits
const LIMITS = {
  ALBUM_NAME_MAX: 100,
  ALBUM_DESCRIPTION_MAX: 2000,
  PHOTO_TITLE_MAX: 200,
  PHOTO_CAPTION_MAX: 2000,
  PHOTO_ALT_TEXT_MAX: 500
};

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function validateLength(value, maxLength, fieldName) {
  if (value && value.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  return null;
}

export async function listAlbums(req, res, next) {
  try {
    let sql = `
      SELECT a.*, u.username as owner_name,
             (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) as photo_count,
             (SELECT JSON_OBJECT('id', p.id, 'filename', p.filename, 'thumbnail_path', p.thumbnail_path)
              FROM photos p WHERE p.id = a.cover_photo_id) as cover_photo
      FROM albums a
      JOIN users u ON a.owner_id = u.id
    `;

    const params = [];

    // If user is authenticated, show their private albums too
    if (req.user) {
      if (req.user.role === 'admin') {
        // Admin sees all albums
      } else {
        sql += ` WHERE (a.visibility = 'public' OR a.owner_id = ?)`;
        params.push(req.user.id);
      }
    } else {
      sql += ` WHERE a.visibility = 'public'`;
    }

    sql += ` ORDER BY a.created_at DESC`;

    const albums = await query(sql, params);

    // Parse cover_photo JSON
    albums.forEach(album => {
      if (album.cover_photo && typeof album.cover_photo === 'string') {
        try {
          album.cover_photo = JSON.parse(album.cover_photo);
        } catch (e) {
          album.cover_photo = null;
        }
      }
    });

    res.json({ albums });
  } catch (error) {
    next(error);
  }
}

export async function getAlbum(req, res, next) {
  try {
    const { slug } = req.params;

    const album = await queryOne(
      `SELECT a.*, u.username as owner_name
       FROM albums a
       JOIN users u ON a.owner_id = u.id
       WHERE a.slug = ?`,
      [slug]
    );

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check visibility
    if (album.visibility === 'private') {
      if (!req.user || (req.user.id !== album.owner_id && req.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get photos
    const photos = await query(
      `SELECT id, filename, thumbnail_path, title, caption, alt_text,
              license, exif_data, width, height, view_count, created_at
       FROM photos
       WHERE album_id = ?
       ORDER BY sort_order ASC, created_at DESC`,
      [album.id]
    );

    album.photos = photos;

    res.json({ album });
  } catch (error) {
    next(error);
  }
}

export async function createAlbum(req, res, next) {
  try {
    const { name, description, visibility = 'private', compression_enabled = true, thumbnail_quality = 80 } = req.body;
    console.log(`[Album] Creating album: "${name}"`);

    if (!name) {
      return res.status(400).json({ error: 'Album name is required' });
    }

    // Validate input lengths
    const nameError = validateLength(name, LIMITS.ALBUM_NAME_MAX, 'Album name');
    if (nameError) return res.status(400).json({ error: nameError });

    const descError = validateLength(description, LIMITS.ALBUM_DESCRIPTION_MAX, 'Description');
    if (descError) return res.status(400).json({ error: descError });

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await queryOne('SELECT id FROM albums WHERE slug = ?', [slug]);
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await queryOne('SELECT id FROM albums WHERE slug = ?', [slug]);
      counter++;
    }

    const result = await query(
      `INSERT INTO albums (owner_id, name, slug, description, visibility, compression_enabled, thumbnail_quality)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, slug, description || '', visibility, compression_enabled, thumbnail_quality]
    );

    const album = await queryOne(
      'SELECT * FROM albums WHERE id = ?',
      [result.insertId]
    );
    console.log(`[Album] Created album id: ${album.id}, slug: ${album.slug}`);

    res.status(201).json({ album });
  } catch (error) {
    next(error);
  }
}

export async function updateAlbum(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, visibility } = req.body;

    // Validate input lengths
    const nameError = validateLength(name, LIMITS.ALBUM_NAME_MAX, 'Album name');
    if (nameError) return res.status(400).json({ error: nameError });

    const descError = validateLength(description, LIMITS.ALBUM_DESCRIPTION_MAX, 'Description');
    if (descError) return res.status(400).json({ error: descError });

    const album = await queryOne('SELECT * FROM albums WHERE id = ?', [id]);

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check ownership
    if (album.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (visibility) {
      updates.push('visibility = ?');
      values.push(visibility);
    }

    if (updates.length > 0) {
      values.push(id);
      await query(
        `UPDATE albums SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updatedAlbum = await queryOne('SELECT * FROM albums WHERE id = ?', [id]);

    res.json({ album: updatedAlbum });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const { id } = req.params;
    const { compression_enabled, thumbnail_quality } = req.body;

    const album = await queryOne('SELECT * FROM albums WHERE id = ?', [id]);

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check ownership
    if (album.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query(
      `UPDATE albums SET compression_enabled = ?, thumbnail_quality = ? WHERE id = ?`,
      [compression_enabled, thumbnail_quality, id]
    );

    const updatedAlbum = await queryOne('SELECT * FROM albums WHERE id = ?', [id]);

    res.json({ album: updatedAlbum });
  } catch (error) {
    next(error);
  }
}

export async function deleteAlbum(req, res, next) {
  try {
    const { id } = req.params;

    const album = await queryOne('SELECT * FROM albums WHERE id = ?', [id]);

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check ownership
    if (album.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all photos to delete files
    const photos = await query('SELECT * FROM photos WHERE album_id = ?', [id]);

    // Delete photo files
    for (const photo of photos) {
      try {
        await fs.unlink(photo.file_path);
        await fs.unlink(photo.thumbnail_path);
      } catch (e) {
        console.error(`Failed to delete photo files for ${photo.id}:`, e);
      }
    }

    // Delete album (photos will be cascade deleted)
    await query('DELETE FROM albums WHERE id = ?', [id]);
    console.log(`[Album] Deleted album id: ${id} with ${photos.length} photos`);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function uploadPhotos(req, res, next) {
  try {
    const { albumId } = req.params;
    const files = req.files;

    console.log(`[Upload] Starting upload of ${files?.length || 0} files to album ${albumId}`);

    if (!files || files.length === 0) {
      console.log('[Upload] No files in request');
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const album = await queryOne('SELECT * FROM albums WHERE id = ?', [albumId]);

    if (!album) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check permission
    if (album.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`[Upload] Processing file ${i + 1}/${files.length}: ${file.originalname}`);

      try {
        const photoData = await processImage(file, album);
        console.log(`[Upload] Processed ${file.originalname} → ${photoData.filename}`);

        const result = await query(
          `INSERT INTO photos (
            album_id, uploader_id, filename, original_filename,
            file_path, thumbnail_path, mime_type, file_size,
            width, height, exif_data, license
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            albumId,
            req.user.id,
            photoData.filename,
            file.originalname,
            photoData.originalPath,
            photoData.thumbnailPath,
            file.mimetype,
            photoData.fileSize,
            photoData.width,
            photoData.height,
            JSON.stringify(photoData.exif),
            'All Rights Reserved'
          ]
        );

        const photo = await queryOne('SELECT * FROM photos WHERE id = ?', [result.insertId]);
        uploadedPhotos.push(photo);
        console.log(`[Upload] Saved photo id: ${photo.id}, filename: ${photo.filename}`);

        // Set as cover if album has no cover
        if (!album.cover_photo_id) {
          await query('UPDATE albums SET cover_photo_id = ? WHERE id = ?', [photo.id, albumId]);
          console.log(`[Upload] Set photo ${photo.id} as album cover`);
        }

        // Clean up temp file
        await fs.unlink(file.path);
      } catch (err) {
        console.error(`[Upload] Failed to process ${file.originalname}:`, err);
        // Clean up temp file on error
        try {
          await fs.unlink(file.path);
        } catch (e) {}
      }
    }

    console.log(`[Upload] Complete. Successfully uploaded ${uploadedPhotos.length}/${files.length} photos`);
    res.status(201).json({ photos: uploadedPhotos });
  } catch (error) {
    next(error);
  }
}
