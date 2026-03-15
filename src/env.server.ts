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

  // DB
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  ADMIN_REVALIDATE_TOKEN: z.string().optional(),

  // Cron / revalidate
  CRON_SECRET: z.string().optional(),

  // Brevo
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER: z.string().optional(),
  BREVO_SENDER_NAME: z.string().optional(),

  // Recaptcha
  RECAPTCHA_SECRET_KEY: z.string().optional(),
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

  MONGODB_URI: process.env.MONGODB_URI ?? process.env.MONGO_URL ?? undefined,
  MONGODB_DB: process.env.MONGODB_DB ?? process.env.MONGO_DB ?? undefined,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? undefined,
  AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? undefined,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? undefined,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ?? undefined,
  ADMIN_REVALIDATE_TOKEN: process.env.ADMIN_REVALIDATE_TOKEN ?? undefined,
  CRON_SECRET: process.env.CRON_SECRET ?? undefined,

  BREVO_API_KEY: process.env.BREVO_API_KEY ?? undefined,
  BREVO_SENDER: process.env.BREVO_SENDER ?? undefined,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME ?? undefined,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ?? undefined,
})

/** En production, clés critiques requises (évite fallbacks dangereux). */
const isProduction = process.env.NODE_ENV === 'production'
if (isProduction) {
  if (!serverEnv.STRIPE_SECRET_KEY?.trim()) {
    throw new Error('STRIPE_SECRET_KEY is required in production')
  }
  const authSecret = serverEnv.NEXTAUTH_SECRET ?? serverEnv.AUTH_SECRET
  if (!authSecret?.trim() || authSecret === 'change-me') {
    throw new Error('NEXTAUTH_SECRET or AUTH_SECRET must be set and strong in production')
  }
}

