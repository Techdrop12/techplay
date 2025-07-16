export function logSeoEvent(event, data = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      event_category: 'SEO',
      ...data,
    });
  }
}
