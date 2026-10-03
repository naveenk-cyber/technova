import { z } from 'zod';

export const getProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    minRating: z.string().regex(/^[0-5](\.\d)?$/).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'relevance']).optional().default('relevance'),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z
      .string()
      .regex(/^\d+$/)
      .refine((value) => Number(value) <= 100, 'Limit cannot exceed 100')
      .optional()
      .default('12'),
  }),
});

export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const getProductBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().min(10),
    brand: z.string().min(2),
    price: z.number().min(0),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0),
    categoryId: z.string().uuid(),
    images: z.array(z.string().url()).min(1),
    specifications: z.record(z.string(), z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    slug: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    brand: z.string().min(2).optional(),
    price: z.number().min(0).optional(),
    discount: z.number().min(0).max(100).optional(),
    stock: z.number().int().min(0).optional(),
    categoryId: z.string().uuid().optional(),
    images: z.array(z.string().url()).optional(),
    specifications: z.record(z.string(), z.string()).optional(),
  }),
});
