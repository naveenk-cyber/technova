import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Cannot add more than 50 of the same item'),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50),
  }),
});

export const removeCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().uuid('Invalid item ID'),
  }),
});
