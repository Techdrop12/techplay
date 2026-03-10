// Augment NodeJS.ProcessEnv with env vars used across the app.
// Keep them optional unless they are guaranteed in every environment.

export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'

      // Public
      NEXT_PUBLIC_SITE_URL?: string
      NEXT_PUBLIC_APP_NAME?: string
      NEXT_PUBLIC_APP_VERSION?: string
      NEXT_PUBLIC_SITE_NAME?: string
      NEXT_PUBLIC_SUPPORT_EMAIL?: string
      NEXT_PUBLIC_EMAIL_LOGO_URL?: string
      NEXT_PUBLIC_COMPANY_ADDRESS?: string
      NEXT_PUBLIC_EMAIL_PIXEL_URL?: string

      // Analytics
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
      NEXT_PUBLIC_META_PIXEL_ID?: string
      NEXT_PUBLIC_HOTJAR_ID?: string
      NEXT_PUBLIC_HOTJAR_SV?: string

      // Payments
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string

      // Feature flags / runtime
      NEXT_PUBLIC_VERCEL_ENV?: 'development' | 'preview' | 'production'

      // Server only
      OPENAI_API_KEY?: string
      STRIPE_SECRET_KEY?: string
      STRIPE_WEBHOOK_SECRET?: string
      MONGODB_URI?: string
      JWT_SECRET?: string
      RESEND_API_KEY?: string
      WEB_PUSH_PUBLIC_KEY?: string
      WEB_PUSH_PRIVATE_KEY?: string
      SENTRY_DSN?: string

      // Vercel / hosting
      VERCEL?: '1' | '0'
      VERCEL_URL?: string

      // Next.js runtime
      NEXT_RUNTIME?: 'edge' | 'nodejs'
    }
  }
}