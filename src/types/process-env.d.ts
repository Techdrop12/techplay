// Augment NodeJS.ProcessEnv with all env vars you use (client + server).
// Keep them optional unless you *always* define them in all environments.

export {};

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';

    // --- Public (exposed to browser via NEXT_PUBLIC_*) ---
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_APP_NAME?: string;
    NEXT_PUBLIC_APP_VERSION?: string;

    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
    NEXT_PUBLIC_META_PIXEL_ID?: string;
    NEXT_PUBLIC_HOTJAR_ID?: string; // e.g. '1234567'
    NEXT_PUBLIC_HOTJAR_SV?: string; // e.g. '6'

    // Payments
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;

    // Feature flags / runtime
    NEXT_PUBLIC_VERCEL_ENV?: 'development' | 'preview' | 'production';

    // --- Server only ---
    OPENAI_API_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    RESEND_API_KEY?: string;
    WEB_PUSH_PUBLIC_KEY?: string;
    WEB_PUSH_PRIVATE_KEY?: string;
    SENTRY_DSN?: string;

    // Vercel/hosting
    VERCEL?: '1' | '0';
    VERCEL_URL?: string;

    // Next.js runtime
    NEXT_RUNTIME?: 'edge' | 'nodejs';
  }
}
