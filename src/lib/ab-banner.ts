// src/lib/ab-banner.ts
// ✅ Bannière A/B via utilitaire générique + tracking impression (GA4 + dataLayer)

import { getABVariant } from './ab-test'
import { logEvent, pushDataLayer } from './ga'

export function getBannerVariant() {
  const variants = [
    'Livraison offerte dès 50€',
    '10% offerts avec le code WELCOME10',
    'Retour 30 jours gratuit',
  ]

  const chosen = getABVariant('top-banner', variants, { ttlDays: 60 })

  // Track impression (client only)
  if (typeof window !== 'undefined') {
    try {
      pushDataLayer({ event: 'banner_impression', banner_text: chosen, position: 'top' })
      logEvent('banner_impression', { banner_text: chosen, position: 'top' })
    } catch {}
  }

  return chosen
}
