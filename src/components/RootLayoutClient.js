'use client';

import { useEffect } from 'react';

export default function RootLayoutClient({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 🌙 Dark mode dynamique
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const setTheme = () => {
        if (darkQuery.matches) {
          document.documentElement.classList.add('dark');
          document.body.style.backgroundColor = '#111827'; // zinc-900
        } else {
          document.documentElement.classList.remove('dark');
          document.body.style.backgroundColor = '#f8fafc'; // slate-50
        }
      };
      setTheme();
      darkQuery.addEventListener('change', setTheme);
      return () => darkQuery.removeEventListener('change', setTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ✅ Google Analytics (GA4)
    const gaId = process.env.NEXT_PUBLIC_GA4_ID;
    if (gaId && window.gtag) {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', gaId);
    }

    // ✅ Meta Pixel
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    if (pixelId && !window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }

    // ✅ Microsoft Clarity
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    if (clarityId && !window.clarity) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = true;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', clarityId);
    }

    // ✅ Hotjar
    const hotjarId = process.env.NEXT_PUBLIC_HOTJAR_ID;
    if (hotjarId && !window.hj) {
      (function (h, o, t, j, a, r) {
        h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
        h._hjSettings = { hjid: parseInt(hotjarId), hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = true;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    // ✅ PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });
  }, []);

  return children;
}
