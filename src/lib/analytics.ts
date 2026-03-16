// src/lib/analytics.ts
import { logEvent as gaLogEvent } from './ga';

export type AnalyticsParams = Record<string, unknown>;

export function sendEvent(name: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined') return;

  try {
    gaLogEvent(name, params ?? {});
    return;
  } catch {}

  const gtag = window.gtag;
  if (typeof gtag === 'function') {
    try {
      gtag('event', name, params ?? {});
      return;
    } catch {}
  }

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: name, ...(params ?? {}) });
  } catch {}
}

export * from './ga';
export default { sendEvent };
