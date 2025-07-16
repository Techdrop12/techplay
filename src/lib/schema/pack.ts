import { z } from 'zod'

export const packSchema = z.object({
  name: z.string().min(3),
  slug: z.string(),
  description: z.string().min(10),
  price: z.number().positive(),
  recommended: z.boolean().optional(),
})
