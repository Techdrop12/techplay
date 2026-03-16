'use client';

import { useEffect } from 'react';

import { log } from '@/lib/logger';

type QueueItem = { event: string; params: Record<string, unknown> };
const _queue: QueueItem[] = [];

function _hasAnalyticsConsent(): boolean {
  try {
    const s = window.__consentState ?? {};
    const ok = s.analytics_storage !== 'denied';
    const ls = localStorage.getItem('consent:analytics') === '1';
    return ok || ls;
  } catch {
    return false;
  }
}

function _hasAdsConsent(): boolean {
  try {
    const s = window.__consentState ?? {};
    const ok =
      s.ad_storage !== 'denied' || s.ad_user_data !== 'denied' || s.ad_personalization !== 'denied';
    const ls = localStorage.getItem('consent:ads') === '1';
    return ok || ls;
  } catch {
    return false;
  }
}

function _flush(): void {
  if (typeof window === 'undefined') return;
  while (_queue.length > 0) {
    const item = _queue.shift();
    if (!item) break;
    const { event, params } = item;

    try {
      if (_hasAnalyticsConsent() && typeof window.gtag === 'function') {
        window.gtag('event', event, params);
      }
    } catch {}

    try {
      if (
        _hasAnalyticsConsent() &&
        window.dataLayer &&
        typeof window.dataLayer.push === 'function'
      ) {
        window.dataLayer.push({ event, ...(params ?? {}) });
      }
    } catch {}

    try {
      if (_hasAdsConsent() && typeof window.fbq === 'function') {
        window.fbq('trackCustom', event, params);
      }
    } catch {}

    try {
      const clarity = (window as { clarity?: (...args: unknown[]) => void }).clarity;
      if (_hasAnalyticsConsent() && typeof clarity === 'function') {
        clarity('event', event, params);
      }
    } catch {}

    try {
      const ttq = (window as { ttq?: { track: (e: string, p?: unknown) => void } }).ttq;
      if (_hasAdsConsent() && ttq && typeof ttq.track === 'function') {
        ttq.track(event, params);
      }
    } catch {}

    log('[analytics]', event, params);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', _flush);
  window.addEventListener('tp:consent', _flush);
}

export function track(event: string, params: Record<string, unknown> = {}): void {
  if (!event) return;
  _queue.push({ event, params });
  _flush();
}

export function useAnalytics(event: string, params: Record<string, unknown> = {}): void {
  const paramsKey = JSON.stringify(params);
  useEffect(() => {
    if (!event) return;
    try {
      track(event, params);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params serialized in paramsKey
  }, [event, paramsKey]);
}
