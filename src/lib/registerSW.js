// ✅ /src/lib/registerSW.js (PWA service worker registration)
export function registerSW() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/firebase-messaging-sw.js');
    });
  }
}
