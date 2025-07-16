import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string().min(5),
  slug: z.string(),
  description: z.string().min(10),
  content: z.string().min(50),
})
