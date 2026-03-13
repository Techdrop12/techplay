// src/lib/performance.ts — router des Web Vitals vers analytics ou API
// @deprecated Non importé. Métriques perf optionnelles.

import { log } from '@/lib/logger'

export type WebVitalMetric = {
  name: string
  value: number
  id?: string
  label?: string
}

function normalizeMetricValue(metric: WebVitalMetric): number {
  // CLS est souvent très petit, on le remonte pour un reporting plus lisible
  if (metric.name === 'CLS') {
    return Math.round(metric.value * 1000)
  }

  return Math.round(metric.value)
}

function sendToGoogleAnalytics(metric: WebVitalMetric): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return

  window.gtag('event', metric.name, {
    value: normalizeMetricValue(metric),
    event_category: 'Web Vitals',
    event_label: metric.id || metric.label || 'vital',
    non_interaction: true,
  })
}

function sendToVitalsApi(metric: WebVitalMetric): void {
  if (typeof navigator === 'undefined') return
  if (typeof navigator.sendBeacon !== 'function') return

  const payload = new Blob([JSON.stringify(metric)], {
    type: 'application/json',
  })

  navigator.sendBeacon('/api/vitals', payload)
}

export function reportWebVitals(metric: WebVitalMetric): void {
  try {
    sendToGoogleAnalytics(metric)
    sendToVitalsApi(metric)

    log('[Perf]', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
    })
  } catch {
    // no-op
  }
}