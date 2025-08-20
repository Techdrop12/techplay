import { z } from 'zod';

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5),
  author: z.string().optional(),
  createdAt: z.date().optional(),
});
