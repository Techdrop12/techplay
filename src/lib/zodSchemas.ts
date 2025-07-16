import { z } from 'zod'

export const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
})

export const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  address: z.string().min(5),
})
