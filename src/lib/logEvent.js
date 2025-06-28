// ✅ /src/lib/logEvent.js (universal event logger : GA4, Pixel, Brevo, tracking)
export function logEvent(event, params = {}) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  }
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', event, params);
  }
  // Brevo
  if (typeof window !== 'undefined' && window._brevo && event === 'newsletter_signup') {
    window._brevo.track('event', params);
  }
  // Ajoute d’autres plateformes ici si besoin (Hotjar, etc)
}
