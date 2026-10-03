import { z } from 'zod';

const historyTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(2000),
});

export const advisorRequestSchema = z.object({
  body: z.object({
    message: z.string().trim().min(3, 'Please describe what you are looking for').max(500, 'Message is too long'),
    history: z.array(historyTurnSchema).max(6, 'Too many history messages').optional(),
  }),
});
