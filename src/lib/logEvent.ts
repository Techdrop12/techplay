// src/lib/logEvent.ts — Adaptateur universel pour les événements GA4
import { event as eventObj, logEvent as logStr } from './ga'

export type GAObjectEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  nonInteraction?: boolean
  params?: Record<string, unknown>
}

/**
 * Accepte soit:
 *  - logEvent('event_name', { ...params })
 *  - logEvent({ action: 'event_name', category, label, value, ... })
 */
export function logEvent(nameOrObj: string | GAObjectEvent, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  try {
    if (typeof nameOrObj === 'string') {
      // Ancienne signature: (name, params)
      return logStr(nameOrObj, params)
    }
    // Nouvelle signature objet, typée
    return eventObj(nameOrObj)
  } catch {
    // Fallback best-effort si gtag dispo
    const w = window as any
    if (typeof w?.gtag === 'function') {
      if (typeof nameOrObj === 'string') {
        w.gtag('event', nameOrObj, params || {})
      } else {
        const { action, ...rest } = nameOrObj
        w.gtag('event', action, rest || {})
      }
    }
  }
}

export default logEvent
