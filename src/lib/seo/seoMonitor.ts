// ✅ src/lib/seo/seoMonitor.ts

/**
 * Envoie un événement de page SEO au dataLayer (GTM)
 */
export function seoMonitor(page: string, extra: Record<string, any> = {}) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'seo_page_view',
      page,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }
}

/**
 * Envoie un événement SEO à Google Analytics 4 (gtag)
 */
export function logSeoEvent(event: string, data: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, {
      event_category: 'SEO',
      ...data,
    });
  }
}

/**
 * Permet de remonter une erreur SEO potentielle
 */
export function reportSEOIssue(message: string, context: Record<string, any> = {}) {
  if (typeof window !== 'undefined') {
    console.warn('[SEO Monitor]', message, context);
    // Exemple futur : envoyer vers API /logs
    // fetch('/api/log-seo', { method: 'POST', body: JSON.stringify({ message, ...context }) })
  }
}
