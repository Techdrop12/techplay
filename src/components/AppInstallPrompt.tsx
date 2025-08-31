// src/components/AppInstallPrompt.tsx — FINAL
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/Button'
import { showToast } from '@/components/ToastSystem'
import { logEvent } from '@/lib/ga'

/** Type minimal pour l’event beforeinstallprompt (non standard dans TS) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

declare global {
  interface Window {
    __TP_INSTALL_SEEN?: boolean
    safari?: any
  }
}

/* ---------- Constantes ---------- */

const DISMISS_UNTIL_KEY = 'pwa:install:dismiss_until'   // timestamp (ms)
const DISMISS_DAYS = 14                                 // ne pas remontrer avant X jours
const SHOW_TOASTS = true

/* ---------- Helpers runtime ---------- */

function now() {
  return Date.now()
}

/** L’app est-elle déjà installée (standalone) ? */
function isInstalled(): boolean {
  if (typeof window === 'undefined') return false
  const mql = window.matchMedia?.('(display-mode: standalone)')
  const iosStandalone = (window.navigator as any).standalone === true // iOS
  return !!(mql?.matches || iosStandalone)
}

/** UA simple pour l’aide iOS (A2HS) */
function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIOS && isSafari
}

function getDismissUntil(): number {
  try {
    const v = localStorage.getItem(DISMISS_UNTIL_KEY)
    return v ? Number(v) || 0 : 0
  } catch {
    return 0
  }
}

function setDismissForDays(days = DISMISS_DAYS) {
  try {
    const until = now() + days * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_UNTIL_KEY, String(until))
  } catch {}
}

/* ---------- Composant principal ---------- */

export default function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const seenRef = useRef(false) // évite doubles affichages immédiats

  const installed = isInstalled()
  const ios = isIosSafari()

  // Décision d’affichage : on montre si :
  // - l’app n’est pas installée
  // - pas en période de "ne plus montrer"
  // - on a soit l’event BIP (Android/Chrome), soit on est iOS Safari (aide A2HS)
  const canShowIOSHelp = ios && !installed && getDismissUntil() < now()
  const canShowBIP = !ios && !installed && getDismissUntil() < now()

  /* ---------- Listeners navigateur ---------- */

  useEffect(() => {
    if (installed) {
      // Nettoyage si déjà installée
      try { localStorage.removeItem(DISMISS_UNTIL_KEY) } catch {}
      setDeferredPrompt(null)
      setVisible(false)
      setIosHelp(false)
      return
    }

    const onAppInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
      setIosHelp(false)
      try { localStorage.removeItem(DISMISS_UNTIL_KEY) } catch {}
      window.__TP_INSTALL_SEEN = true
      if (SHOW_TOASTS) showToast?.({ type: 'success', message: 'Application installée 🎉' })
      logEvent('pwa_app_installed')
    }

    // Android/Chrome : intercepter l’event et afficher notre UI
    const onBeforeInstallPrompt = (e: Event) => {
      if (window.__TP_INSTALL_SEEN) return
      if (!canShowBIP) return

      e.preventDefault()
      window.__TP_INSTALL_SEEN = true
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
      seenRef.current = true
      logEvent('pwa_prompt_shown', { platform: 'android_chrome' })
    }

    window.addEventListener('appinstalled', onAppInstalled)
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as any)

    return () => {
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installed, canShowBIP])

  // iOS Safari : si pas d’event BIP, proposer l’aide A2HS une fois
  useEffect(() => {
    if (installed || seenRef.current || window.__TP_INSTALL_SEEN) return
    if (canShowIOSHelp) {
      setIosHelp(true)
      setVisible(true)
      window.__TP_INSTALL_SEEN = true
      seenRef.current = true
      logEvent('pwa_ios_help_shown')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installed, canShowIOSHelp])

  /* ---------- Actions ---------- */

  const dismiss = useCallback(() => {
    setVisible(false)
    setIosHelp(false)
    setDismissForDays()
    logEvent('pwa_prompt_dismiss', { ios })
  }, [ios])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const { outcome, platform } = await deferredPrompt.userChoice
      logEvent('pwa_install_click', { outcome, platform })
      if (outcome === 'accepted') {
        if (SHOW_TOASTS) showToast?.({ type: 'success', message: 'Installation lancée ✅' })
      } else {
        if (SHOW_TOASTS) showToast?.({ type: 'info', message: 'Installation annulée.' })
      }
    } catch {
      if (SHOW_TOASTS) showToast?.({ type: 'error', message: 'Impossible de lancer l’installation.' })
      logEvent('pwa_install_error')
    } finally {
      setDeferredPrompt(null)
      setVisible(false)
      setDismissForDays() // évite spam si l’utilisateur annule
    }
  }, [deferredPrompt])

  /* ---------- Rendu ---------- */

  if (!visible) return null

  // UI : bottom sheet compacte, a11y, tokens, responsive
  return (
    <div
      className="fixed inset-x-3 bottom-4 z-[95] mx-auto max-w-xl rounded-2xl border border-token-border bg-token-surface px-4 py-3 shadow-elevated md:inset-x-auto md:left-6 md:right-auto"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-2xl" aria-hidden>📲</div>

        <div className="flex-1">
          <h2 id="pwa-install-title" className="text-sm font-bold">
            Installer <span className="text-gradient">TechPlay</span>
          </h2>

          {!iosHelp ? (
            <p id="pwa-install-desc" className="mt-1 text-sm text-token-text/70">
              Accès rapide, notifications, et mode hors-ligne.
            </p>
          ) : (
            <div id="pwa-install-desc" className="mt-1 text-sm text-token-text/80">
              <p className="text-token-text/70">
                Sur iPhone/iPad&nbsp;:
              </p>
              <ol className="ml-4 list-decimal space-y-0.5">
                <li>Appuyez sur <strong>Partager</strong> dans Safari.</li>
                <li>Sélectionnez <strong>« Sur l’écran d’accueil »</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={dismiss}
            aria-label="Plus tard"
          >
            Plus tard
          </Button>

          {!iosHelp && deferredPrompt ? (
            <Button
              variant="accent"
              size="sm"
              onClick={handleInstall}
              aria-label="Installer l’application"
            >
              Installer
            </Button>
          ) : (
            // Sur iOS on affiche un bouton “OK” pour fermer l’aide
            <Button
              variant="accent"
              size="sm"
              onClick={dismiss}
              aria-label="OK"
            >
              OK
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
