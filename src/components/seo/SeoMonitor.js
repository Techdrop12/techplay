export function seoMonitor({ page, locale }) {
  if (process.env.NODE_ENV !== 'production') return;

  console.log(`[SEO] ${locale.toUpperCase()} → ${page}`);
}
