import { z } from 'zod'

export const invoiceSchema = z.object({
  orderId: z.string(),
  customerName: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  total: z.number(),
})
