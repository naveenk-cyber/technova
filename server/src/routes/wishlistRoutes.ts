import { Router } from 'express';
import * as wishlistController from '../controllers/wishlistController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { addToWishlistSchema, removeFromWishlistSchema } from '../validations/wishlist.validation';

const router = Router();

// All wishlist routes require authentication
router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/', validateRequest(addToWishlistSchema), wishlistController.addToWishlist);
router.delete('/:productId', validateRequest(removeFromWishlistSchema), wishlistController.removeFromWishlist);

export default router;
