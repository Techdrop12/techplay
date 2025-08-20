import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string(),
  description: z.string().min(10),
  price: z.number().positive(),
  image: z.string().url(),
  featured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
});
