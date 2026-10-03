import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createReviewSchema } from '../validations/review.validation';
import * as reviewController from '../controllers/reviewController';

const router = Router();

router.post('/', requireAuth, validateRequest(createReviewSchema), reviewController.createReview);

export default router;
