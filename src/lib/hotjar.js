// ✅ /src/lib/hotjar.js (Hotjar user analytics, bonus tracking)
export function initHotjar() {
  if (typeof window !== 'undefined' && !window.hj) {
    (function(h, o, t, j, a, r) {
      h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
      h._hjSettings = { hjid: process.env.NEXT_PUBLIC_HOTJAR_ID, hjsv: 6 };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script'); r.async = 1;
      r.src = 'https://static.hotjar.com/c/hotjar-' + h._hjSettings.hjid + '.js?sv=' + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document);
  }
}
