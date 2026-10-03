import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { advisorRequestSchema } from '../validations/ai.validation';
import * as aiController from '../controllers/aiController';

const router = Router();

router.post('/advisor', validateRequest(advisorRequestSchema), aiController.postAdvisor);

export default router;
