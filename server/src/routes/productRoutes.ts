import { Router } from 'express';
import * as productController from '../controllers/productController';
import { validateRequest } from '../middleware/validateRequest';
import { getProductsQuerySchema, getProductByIdSchema, getProductBySlugSchema, createProductSchema, updateProductSchema } from '../validations/product.validation';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/', validateRequest(getProductsQuerySchema), productController.getProducts);
router.get('/:id', validateRequest(getProductByIdSchema), productController.getProductById);
router.get('/slug/:slug', validateRequest(getProductBySlugSchema), productController.getProductBySlug);

// Admin only routes
router.use(requireAuth, requireAdmin);

router.post('/', validateRequest(createProductSchema), productController.createProduct);
router.put('/:id', validateRequest(updateProductSchema), productController.updateProduct);
router.delete('/:id', validateRequest(getProductByIdSchema), productController.deleteProduct);

export default router;
