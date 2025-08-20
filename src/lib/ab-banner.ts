// src/lib/ab-banner.ts
// ✅ Bannière A/B basée sur l’utilitaire générique + tracking impression

import { getABVariant } from './ab-test'
import { sendEvent } from './analytics'

export function getBannerVariant() {
  const variants = [
    'Livraison offerte dès 50€',
    '10% offerts avec le code WELCOME10',
    'Retour 30 jours gratuit',
  ]
  const chosen = getABVariant('top-banner', variants, { ttlDays: 60 })

  // Track impression (client only)
  if (typeof window !== 'undefined') {
    sendEvent('banner_impression', { banner_text: chosen, position: 'top' })
  }
  return chosen
}
