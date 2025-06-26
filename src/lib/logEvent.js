// ✅ src/lib/logEvent.js

export function logEvent(event, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  }
  // Optionnel : envoyez les logs côté serveur ou vers une API
  // fetch('/api/track-ab', { method: 'POST', body: JSON.stringify({ event, ...params }) });
}
