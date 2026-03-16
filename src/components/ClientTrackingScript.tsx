// src/components/ClientTrackingScript.tsx
'use client';

import { useEffect, useMemo, useRef } from 'react';

import { logEvent } from '@/lib/ga';
import { trackPixel, pixelReadyAndConsented } from '@/lib/meta-pixel';

type Props = {
  event: string;
  params?: Record<string, unknown>;
  once?: boolean;
  onceKey?: string;
  fallbackToDataLayer?: boolean;
  mirrorToMetaPixel?: boolean;
};

const META_EVENT_MAP: Record<string, string> = {
  page_view: 'PageView',
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
};

function toOnceKey(evt: string, params?: Record<string, unknown>, custom?: string) {
  if (custom) return `cts:${custom}`;
  const p = params ? JSON.stringify(params) : '';
  return `cts:${evt}:${p}`;
}

export default function ClientTrackingScript({
  event,
  params,
  once = true,
  onceKey,
  fallbackToDataLayer = true,
  mirrorToMetaPixel = true,
}: Props) {
  const fired = useRef(false);
  const key = useMemo(() => toOnceKey(event, params, onceKey), [event, params, onceKey]);

  useEffect(() => {
    if (once) {
      if (fired.current) return;
      if (typeof window !== 'undefined' && sessionStorage.getItem(key) === '1') return;
    }

    fired.current = true;

    try {
      logEvent(event, params);
    } catch {}

    if (fallbackToDataLayer) {
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event, ...(params || {}) });
      } catch {}
    }

    if (mirrorToMetaPixel && pixelReadyAndConsented()) {
      try {
        const metaEvt = META_EVENT_MAP[event] || event;
        trackPixel(metaEvt, params);
      } catch {}
    }

    if (once && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(key, '1');
      } catch {}
    }
  }, [event, key, params, once, fallbackToDataLayer, mirrorToMetaPixel]);

  return null;
}
