import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/authMiddleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.get('/me', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, validateRequest(updateProfileSchema), authController.updateProfile);

export default router;
