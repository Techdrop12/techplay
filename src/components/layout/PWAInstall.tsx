'use client'

/**
 * Pont neutre conservé pour compatibilité (Layout l'importe encore).
 * Toute la logique d'installation PWA est désormais centralisée dans
 * `src/components/AppInstallPrompt.tsx`.
 */
export default function PWAInstall() {
  if (process.env.NODE_ENV !== 'production') {
    // Petit rappel en dev pour éviter les doublons plus tard
    // eslint-disable-next-line no-console
    console.debug('[PWAInstall] noop — logique déplacée vers AppInstallPrompt.')
  }
  return null
}
