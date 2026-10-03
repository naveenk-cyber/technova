import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { placeOrderSchema, getAllOrdersQuerySchema, getOrderByIdSchema, updateOrderStatusSchema } from '../validations/order.validation';

const router = Router();

// All order routes require authentication
router.use(requireAuth);

router.post('/', validateRequest(placeOrderSchema), orderController.placeOrder);
router.get('/', orderController.getMyOrders);
// Admin routes
router.get('/all', requireAdmin, validateRequest(getAllOrdersQuerySchema), orderController.getAllOrders);
router.get('/admin/:orderId', requireAdmin, validateRequest(getOrderByIdSchema), orderController.getAdminOrderById);
router.put('/:orderId/status', requireAdmin, validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);

// User routes
router.get('/:orderId', validateRequest(getOrderByIdSchema), orderController.getOrderById);

export default router;
