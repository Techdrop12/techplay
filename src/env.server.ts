import { z } from 'zod'

const schema = z.object({
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY manquante'),
  STRIPE_API_VERSION: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Marque / facturation
  BRAND_NAME: z.string().optional(),
  BRAND_ADDRESS: z.string().optional(),
  BRAND_URL: z.string().optional(),
  BRAND_EMAIL: z.string().optional(),
  BRAND_VAT: z.string().optional(),
  BRAND_SIRET: z.string().optional(),
  BRAND_LOGO_PATH: z.string().optional(),
})

export const serverEnv = schema.parse({
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_API_VERSION: process.env.STRIPE_API_VERSION,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  BRAND_NAME: process.env.BRAND_NAME,
  BRAND_ADDRESS: process.env.BRAND_ADDRESS,
  BRAND_URL: process.env.BRAND_URL,
  BRAND_EMAIL: process.env.BRAND_EMAIL,
  BRAND_VAT: process.env.BRAND_VAT,
  BRAND_SIRET: process.env.BRAND_SIRET,
  BRAND_LOGO_PATH: process.env.BRAND_LOGO_PATH,
})

