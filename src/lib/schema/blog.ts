import { z } from 'zod';

export const blogSchema = z.object({
  title: z.string().min(5),
  slug: z.string().regex(/^[a-z0-9-]+$/i, 'Slug invalide'),
  description: z.string().min(10),
  content: z.string().min(50),
  coverImage: z.string().url().optional(),
  publishedAt: z.date().optional(),
  tags: z.array(z.string()).max(10).optional(),
});
