import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All user routes require admin
router.use(requireAuth);
router.use(requireAdmin);

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deactivateUser);
router.put('/:id/role', userController.changeRole);

export default router;
