// src/lib/logEvent.ts
import { event as eventObj, logEvent as logStr } from './ga'

export type GAObjectEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  nonInteraction?: boolean
  params?: Record<string, unknown>
}

export function logEvent(nameOrObj: string | GAObjectEvent, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  try {
    if (typeof nameOrObj === 'string') {
      return logStr(nameOrObj, params ?? {})
    }

    return eventObj(nameOrObj)
  } catch {
    const gtag = window.gtag
    if (typeof gtag !== 'function') return

    if (typeof nameOrObj === 'string') {
      gtag('event', nameOrObj, params ?? {})
      return
    }

    const { action, ...rest } = nameOrObj
    gtag('event', action, rest)
  }
}

export default logEvent