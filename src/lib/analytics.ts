// src/lib/analytics.ts
// ✅ Fait le pont avec notre util GA4 avancé (`lib/ga.ts`) tout en restant rétro-compatible

import { pageview as _pageview, trackEvent as _trackEvent, consent, setUserId } from './ga'

export const pageview = (url: string) => _pageview(url)
export const sendEvent = (eventName: string, eventParams: Record<string, any> = {}) =>
  _trackEvent(eventName, eventParams)

// Bonus utils (si tu veux les utiliser directement)
export { consent, setUserId }
