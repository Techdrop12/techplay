'use client';

import { useEffect } from 'react';

export function useAnalytics(event, params = {}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (typeof window.gtag === 'function') {
        window.gtag('event', event, params);
      }

      // Facebook Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', event, params);
      }

      // Microsoft Clarity
      if (typeof window.Clarity === 'function') {
        window.Clarity('event', event, params);
      }
    }
  }, [event, params]);
}
