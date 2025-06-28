'use client';

export function logEvent(event, params = {}) {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[logEvent] gtag non disponible :', event, params);
  }

  // Meta (Facebook) Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', event, params);
  }

  // Brevo (Sendinblue) — événement marketing personnalisé
  if (typeof window._brevo === 'object' && event === 'newsletter_signup') {
    window._brevo.track('event', params);
  }

  // Optionnel : log interne (dev uniquement)
  if (process.env.NODE_ENV === 'development') {
    console.log('[logEvent] (dev only)', event, params);
  }

  // Optionnel : backend tracking (AB test, logs, analytics internes)
  // fetch('/api/track', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ event, ...params }),
  // });
}
