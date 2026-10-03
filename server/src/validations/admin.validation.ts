import { z } from 'zod';

export const getUsersQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().max(100, 'Search term is too long').optional(),
    page: z.coerce.number().int('Page must be an integer').min(1, 'Page must be at least 1').optional(),
    limit: z.coerce.number().int('Limit must be an integer').min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  }),
});
