import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { validateRequest } from '../middleware/validateRequest';
import { getCategoryBySlugSchema } from '../validations/category.validation';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', validateRequest(getCategoryBySlugSchema), categoryController.getCategoryBySlug);

export default router;
