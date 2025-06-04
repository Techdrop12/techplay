// src/lib/hotjar.js
'use client';

import { useEffect } from 'react';

const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const HOTJAR_SV = process.env.NEXT_PUBLIC_HOTJAR_SV || 6;

export default function useHotjar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!HOTJAR_ID || window.hj) return;

    try {
      (function (h, o, t, j, a, r) {
        h.hj =
          h.hj ||
          function () {
            (h.hj.q = h.hj.q || []).push(arguments);
          };
        h._hjSettings = { hjid: HOTJAR_ID, hjsv: HOTJAR_SV };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = `https://static.hotjar.com/c/hotjar-${HOTJAR_ID}.js?sv=${HOTJAR_SV}`;
        a.appendChild(r);
      })(window, document, 'script', 0, 0, 0);

      window.hj('trigger', 'page_loaded');
    } catch (error) {
      console.warn('❌ Erreur Hotjar :', error);
    }
  }, []);
}
