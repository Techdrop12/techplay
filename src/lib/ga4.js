// ✅ /src/lib/ga4.js (Google Analytics 4 auto, bonus : event dynamique)
export function logGa4Event(action, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
}
