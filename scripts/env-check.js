require('dotenv').config({ path: '.env.local' }); // ← important

const required = [
  'MONGODB_URI',
  'NEXT_PUBLIC_STRIPE_PK',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_BASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'BREVO_API_KEY',
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
  'NEXT_PUBLIC_META_PIXEL_ID'
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn('[.env check] ⛔️ Clés manquantes :', missing.join(', '));
  process.exit(1);
} else {
  console.log('[.env check] ✅ Toutes les clés .env sont présentes.');
}
