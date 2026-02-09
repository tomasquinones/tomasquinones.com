import sharp from 'sharp';
import exifr from 'exifr';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGINALS_DIR = path.join(__dirname, '../../uploads/originals');
const THUMBNAILS_DIR = path.join(__dirname, '../../uploads/thumbnails');
const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

const THUMBNAIL_MAX_SIZE = 800;

// Magic bytes for allowed image types
const MAGIC_BYTES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF]
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46] // RIFF, need to also check for WEBP at offset 8
  ],
  'image/tiff': [
    [0x49, 0x49, 0x2A, 0x00], // Little-endian
    [0x4D, 0x4D, 0x00, 0x2A]  // Big-endian
  ]
};

function validateMagicBytes(buffer, claimedMimeType) {
  const signatures = MAGIC_BYTES[claimedMimeType];
  if (!signatures) {
    return false;
  }

  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // Additional check for WebP: bytes 8-11 should be "WEBP"
      if (claimedMimeType === 'image/webp') {
        const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
        for (let i = 0; i < 4; i++) {
          if (buffer[8 + i] !== webpSignature[i]) {
            return false;
          }
        }
      }
      return true;
    }
  }
  return false;
}

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(ORIGINALS_DIR, { recursive: true });
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

// Initialize directories on module load
ensureDirectories().catch(console.error);

export async function processImage(file, album) {
  const filename = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
  const originalPath = path.join(ORIGINALS_DIR, filename);
  const thumbnailPath = path.join(THUMBNAILS_DIR, filename);

  // Read the file
  const imageBuffer = await fs.readFile(file.path);

  // Validate magic bytes match claimed MIME type
  if (!validateMagicBytes(imageBuffer, file.mimetype)) {
    throw new Error(`File content does not match claimed type: ${file.mimetype}`);
  }

  // Extract EXIF data before any processing
  let exif = null;
  try {
    const fullExif = await exifr.parse(imageBuffer, {
      // Preserve all important EXIF data
      tiff: true,
      exif: true,
      gps: true,
      ifd0: true,
      ifd1: true,
      xmp: true,
      iptc: true,
      icc: false, // Skip ICC profile as it's large
    });

    if (fullExif) {
      exif = {
        camera: {
          make: fullExif.Make,
          model: fullExif.Model,
          software: fullExif.Software
        },
        image: {
          width: fullExif.ImageWidth || fullExif.ExifImageWidth,
          height: fullExif.ImageHeight || fullExif.ExifImageHeight,
          orientation: fullExif.Orientation
        },
        exif: {
          dateTime: fullExif.DateTimeOriginal || fullExif.CreateDate,
          exposureTime: fullExif.ExposureTime,
          fNumber: fullExif.FNumber,
          iso: fullExif.ISO,
          focalLength: fullExif.FocalLength,
          flash: fullExif.Flash,
          whiteBalance: fullExif.WhiteBalance,
          exposureProgram: fullExif.ExposureProgram,
          meteringMode: fullExif.MeteringMode,
          exposureCompensation: fullExif.ExposureCompensation
        },
        gps: fullExif.latitude && fullExif.longitude ? {
          latitude: fullExif.latitude,
          longitude: fullExif.longitude,
          altitude: fullExif.GPSAltitude
        } : null
      };
    }
  } catch (err) {
    console.error('Failed to extract EXIF:', err);
  }

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata();

  // Copy original with EXIF preserved
  // Sharp by default preserves EXIF when not processing
  await fs.copyFile(file.path, originalPath);

  // Create thumbnail
  const thumbnailQuality = album.compression_enabled ? album.thumbnail_quality : 95;

  let thumbnailSharp = sharp(imageBuffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .resize(THUMBNAIL_MAX_SIZE, THUMBNAIL_MAX_SIZE, {
      fit: 'inside',
      withoutEnlargement: true
    });

  // Apply format-specific settings
  if (file.mimetype === 'image/jpeg') {
    thumbnailSharp = thumbnailSharp.jpeg({
      quality: thumbnailQuality,
      mozjpeg: true
    });
  } else if (file.mimetype === 'image/png') {
    thumbnailSharp = thumbnailSharp.png({
      compressionLevel: 9,
      adaptiveFiltering: true
    });
  } else if (file.mimetype === 'image/webp') {
    thumbnailSharp = thumbnailSharp.webp({
      quality: thumbnailQuality
    });
  }

  await thumbnailSharp.toFile(thumbnailPath);

  // Get file stats
  const stats = await fs.stat(originalPath);

  return {
    filename,
    originalPath,
    thumbnailPath,
    fileSize: stats.size,
    width: metadata.width,
    height: metadata.height,
    exif
  };
}

export async function cleanupTempFiles() {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);

      // Delete files older than 1 hour
      if (now - stats.mtimeMs > ONE_HOUR) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning temp files:', err);
  }
}

// Run cleanup periodically
setInterval(cleanupTempFiles, 30 * 60 * 1000); // Every 30 minutes
