// ✅ /src/lib/useAnalytics.js (hook React bonus, GA4, Pixel, events)
import { useEffect } from 'react';

export default function useAnalytics(event, params) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, params);
    }
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', event, params);
    }
  }, [event, params]);
}
