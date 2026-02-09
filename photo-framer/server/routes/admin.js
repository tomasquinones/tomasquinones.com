import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get('/stats', adminController.getStats);

export default router;
