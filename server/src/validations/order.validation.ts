import { z } from 'zod';

export const placeOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.string().min(10, 'Please provide a full shipping address'),
    paymentMethod: z.string().refine(
      (val) => ['CARD', 'UPI', 'COD', 'NET_BANKING'].includes(val),
      { message: 'Invalid payment method. Must be CARD, UPI, COD, or NET_BANKING' }
    ),
  }),
});

export const getAllOrdersQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    search: z.string().trim().max(100, 'Search term is too long').optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z
      .string()
      .regex(/^\d+$/)
      .refine((value) => Number(value) <= 100, 'Limit cannot exceed 100')
      .optional()
      .default('10'),
  }),
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
  }),
});
