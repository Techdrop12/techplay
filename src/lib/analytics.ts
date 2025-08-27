// src/lib/analytics.ts — Adaptateur canonique (SSR-safe) pour l'app
// Exporte `sendEvent` attendu par le code + ré-exporte toute l'API GA.
// Si GA n'est pas prêt, on fait un fallback best-effort vers window.gtag.

import { logEvent as gaLogEvent } from './ga'

export type AnalyticsParams = Record<string, unknown>

/** Helper attendu par l'app (alias stable). */
export function sendEvent(name: string, params?: AnalyticsParams) {
  if (typeof window === 'undefined') return
  try {
    // Utilise notre helper GA4 (ajoute debug_mode, etc. si activé)
    gaLogEvent(name, params)
  } catch {
    // Fallback best-effort si jamais ga.ts change ou n'est pas dispo
    const w = window as any
    if (typeof w?.gtag === 'function') w.gtag('event', name, params || {})
  }
}

// On ré-exporte toute l'API GA (pageview, event, trackPurchase, …)
export * from './ga'

// Optionnel : export par défaut pratique
export default { sendEvent }
