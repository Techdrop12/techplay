// ✅ /src/components/RootLayoutClient.js (full option, tout intégré)
'use client';

import { useEffect } from 'react';

export default function RootLayoutClient({ children }) {
  useEffect(() => {
    // Dark mode auto selon préférences système
    if (typeof window !== 'undefined') {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const setTheme = () => {
        if (darkQuery.matches) {
          document.documentElement.classList.add('dark');
          document.body.style.background = '#111827';
        } else {
          document.documentElement.classList.remove('dark');
          document.body.style.background = '#f8fafc';
        }
      };
      setTheme();
      darkQuery.addEventListener('change', setTheme);
      return () => darkQuery.removeEventListener('change', setTheme);
    }
  }, []);

  useEffect(() => {
    // Google Analytics 4 (GA4) tracking
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA4_ID) {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', process.env.NEXT_PUBLIC_GA4_ID);
    }

    // Microsoft Clarity
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CLARITY_ID) {
      (function(c, l, a, r, i, t, y) {
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", process.env.NEXT_PUBLIC_CLARITY_ID);
    }

    // Meta Pixel (Facebook)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      !(function(f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );
      window.fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID);
      window.fbq('track', 'PageView');
    }

    // Hotjar
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_HOTJAR_ID) {
      (function(h, o, t, j, a, r) {
        h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
        h._hjSettings = { hjid: process.env.NEXT_PUBLIC_HOTJAR_ID, hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script'); r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    // PWA install prompt (bonus UX)
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Empêche la bannière automatique
        e.preventDefault();
        // Stocke l’événement pour déclencher l’UI custom si besoin
        window.deferredPrompt = e;
      });
    }

    // ... Ajoute ici d’autres hooks globaux si besoin (Clarity, Heatmap, chat, etc.)
  }, []);

  return children;
}
