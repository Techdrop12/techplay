// ✅ src/lib/seoMonitor.js (audit SEO & tracking page automatique)

export default function seoMonitor(page, extra = {}) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'seo_page_view',
      page,
      timestamp: new Date().toISOString(),
      ...extra
    });
  }
}

// Utilisation possible dans layout, pages ou effets :
export function reportSEOIssue(message, context = {}) {
  if (typeof window !== 'undefined') {
    console.warn('[SEO Monitor]', message, context);
    // Exemple : on pourrait envoyer ici les erreurs vers une API
    // fetch('/api/log-seo', { method: 'POST', body: JSON.stringify({ message, ...context }) })
  }
}
