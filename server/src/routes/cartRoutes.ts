import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/authMiddleware';
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from '../validations/cart.validation';

const router = Router();

// All cart routes require authentication
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/', validateRequest(addToCartSchema), cartController.addToCart);
router.put('/:itemId', validateRequest(updateCartItemSchema), cartController.updateCartItem);
router.delete('/clear', cartController.clearCart);
router.delete('/:itemId', validateRequest(removeCartItemSchema), cartController.removeFromCart);

export default router;
