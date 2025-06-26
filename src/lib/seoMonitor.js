// ✅ src/lib/seoMonitor.js

export default function seoMonitor(page, extra = {}) {
  // Placez ici votre tracking analytics custom, ou integration externe (GA, Matomo...)
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'seo_page_view', page, ...extra });
  }
}
