// ✅ /src/lib/useAnalytics.js
'use client';
import { useEffect } from 'react';

export function useAnalytics(event, params = {}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.gtag) window.gtag('event', event, params);
      if (window.fbq) window.fbq('trackCustom', event, params);
      if (window.Clarity) window.Clarity('event', event, params);
    }
  }, [event, params]);
}
