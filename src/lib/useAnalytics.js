// ✅ src/lib/useAnalytics.js

import { useEffect } from 'react';

export default function useAnalytics(event, data) {
  useEffect(() => {
    if (!event) return;
    // GA4
    if (window.gtag) window.gtag('event', event, data || {});
    // Meta Pixel
    if (window.fbq) window.fbq('trackCustom', event, data || {});
    // Hotjar
    if (window.hj) window.hj('event', event, data || {});
  }, [event, data]);
}
