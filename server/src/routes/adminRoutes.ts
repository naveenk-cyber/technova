import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { getUsersQuerySchema } from '../validations/admin.validation';
import * as adminController from '../controllers/adminController';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', validateRequest(getUsersQuerySchema), adminController.getUsers);

export default router;
