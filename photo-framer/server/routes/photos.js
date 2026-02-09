import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as photoController from '../controllers/photoController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Rate limiting for full-res requests
const fullResLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Thumbnail serving (handled by static middleware in app.js)
// router.get('/thumb/:filename', ...);

// Photo metadata
router.get('/:id', photoController.getPhoto);

// Full-res token generation (requires auth)
router.get('/:id/full', requireAuth, photoController.getFullResToken);

// Serve full-res with token
router.get('/full/:token/:filename', fullResLimiter, photoController.serveFullRes);

// Update photo
router.put('/:id', requireAuth, photoController.updatePhoto);

// Delete photo
router.delete('/:id', requireAuth, photoController.deletePhoto);

export default router;
