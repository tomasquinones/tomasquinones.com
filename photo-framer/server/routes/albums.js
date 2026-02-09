import { Router } from 'express';
import * as albumController from '../controllers/albumController.js';
import { requireAuth, requireContributor } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = Router();

// Public routes
router.get('/', albumController.listAlbums);
router.get('/:slug', albumController.getAlbum);

// Protected routes
router.post('/', requireAuth, requireContributor, albumController.createAlbum);
router.put('/:id', requireAuth, albumController.updateAlbum);
router.delete('/:id', requireAuth, albumController.deleteAlbum);
router.put('/:id/settings', requireAuth, albumController.updateSettings);

// Photo upload to album
router.post(
  '/:albumId/photos',
  requireAuth,
  requireContributor,
  upload.array('photos', 20),
  albumController.uploadPhotos
);

export default router;
