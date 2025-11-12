// src/lib/analytics.ts — Adaptateur canonique (SSR-safe) pour l'app
// Exporte `sendEvent` attendu par le code + ré-exporte toute l'API GA.
// Si GA n'est pas prêt, fallback best-effort vers gtag/dataLayer.

import { logEvent as gaLogEvent } from './ga'

export type AnalyticsParams = Record<string, unknown>

/** Helper attendu par l'app (alias stable). */
export function sendEvent(name: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined') return
  try {
    gaLogEvent(name, params)
  } catch {
    const w = window as any
    if (typeof w?.gtag === 'function') {
      try { w.gtag('event', name, params || {}) } catch {}
    } else if (Array.isArray(w?.dataLayer)) {
      try { w.dataLayer.push({ event: name, ...(params || {}) }) } catch {}
    }
  }
}

export * from './ga'
export default { sendEvent }
