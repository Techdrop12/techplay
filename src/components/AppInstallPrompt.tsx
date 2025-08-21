// src/components/AppInstallPrompt.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import Button from '@/components/Button'
import { showToast } from '@/components/ToastSystem'

/** Type minimal pour l’event beforeinstallprompt (non standard dans TS) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

const DISMISS_KEY = 'pwa:install:dismissed'

export default function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  // Affiche le prompt si l'utilisateur ne l’a pas “dismiss” précédemment
  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      // Empêche le prompt auto, on gère nous-mêmes
      e.preventDefault()

      // Ne pas re-montrer si l’utilisateur a cliqué “Plus tard”
      try {
        if (localStorage.getItem(DISMISS_KEY) === '1') return
      } catch {}

      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const onAppInstalled = () => {
      // L’app est installée → on cache et on nettoie
      setVisible(false)
      setDeferredPrompt(null)
      try {
        localStorage.removeItem(DISMISS_KEY)
      } catch {}
      showToast?.({ type: 'success', message: "Application installée 🎉" })
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        showToast?.({ type: 'success', message: 'Installation lancée ✅' })
      } else {
        showToast?.({ type: 'info', message: 'Installation annulée.' })
      }
    } catch {
      showToast?.({ type: 'error', message: 'Impossible de lancer l’installation.' })
    } finally {
      setDeferredPrompt(null)
      setVisible(false)
    }
  }, [deferredPrompt])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-xl shadow-lg z-50"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <h2 id="pwa-install-title" className="sr-only">
        Installer l’application
      </h2>
      <p id="pwa-install-desc" className="mb-3 text-sm text-gray-700 dark:text-gray-300">
        Installer l’application <strong>TechPlay</strong> pour un accès rapide et hors-ligne.
      </p>

      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={dismiss}>
          Plus tard
        </Button>
        <Button variant="accent" size="sm" onClick={handleInstall}>
          Installer
        </Button>
      </div>
    </div>
  )
}
