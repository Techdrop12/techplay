// src/components/AppInstallPrompt.tsx — FINAL+ (i18n FR/EN, même API)
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Button from '@/components/Button'
import { showToast } from '@/components/ToastSystem'
import { logEvent } from '@/lib/ga'
import { getCurrentLocale } from '@/lib/i18n-routing'

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

/* ---------- i18n ---------- */
const STR = {
  fr: {
    title: (brand: string) => <>Installer <span className="text-gradient">{brand}</span></>,
    desc: 'Accès rapide, notifications, et mode hors-ligne.',
    iosTitle: 'Sur iPhone/iPad :',
    iosStep1: 'Appuyez sur ',
    iosShare: 'Partager',
    iosStep2: 'Sélectionnez ',
    iosAdd: '« Sur l’écran d’accueil »',
    later: 'Plus tard',
    install: 'Installer',
    ok: 'OK',
    toastInstalled: 'Application installée 🎉',
    toastStarted: 'Installation lancée ✅',
    toastCancelled: 'Installation annulée.',
    toastError: 'Impossible de lancer l’installation.',
    ariaLater: 'Plus tard',
    ariaInstall: 'Installer l’application',
  },
  en: {
    title: (brand: string) => <>Install <span className="text-gradient">{brand}</span></>,
    desc: 'Quick access, notifications, and offline mode.',
    iosTitle: 'On iPhone/iPad:',
    iosStep1: 'Tap ',
    iosShare: 'Share',
    iosStep2: 'Choose ',
    iosAdd: '“Add to Home Screen”',
    later: 'Later',
    install: 'Install',
    ok: 'OK',
    toastInstalled: 'App installed 🎉',
    toastStarted: 'Installation started ✅',
    toastCancelled: 'Installation cancelled.',
    toastError: 'Could not start installation.',
    ariaLater: 'Remind me later',
    ariaInstall: 'Install the app',
  },
} as const

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
  const pathname = usePathname() || '/'
  const locale = (getCurrentLocale(pathname) as 'fr' | 'en') || 'fr'
  const t = STR[locale]

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const seenRef = useRef(false) // évite doubles affichages immédiats

  const installed = isInstalled()
  const ios = isIosSafari()

  // Décision d’affichage
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
      if (SHOW_TOASTS) showToast?.({ type: 'success', message: t.toastInstalled })
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
  }, [installed, canShowBIP, t.toastInstalled])

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
        if (SHOW_TOASTS) showToast?.({ type: 'success', message: t.toastStarted })
      } else {
        if (SHOW_TOASTS) showToast?.({ type: 'info', message: t.toastCancelled })
      }
    } catch {
      if (SHOW_TOASTS) showToast?.({ type: 'error', message: t.toastError })
      logEvent('pwa_install_error')
    } finally {
      setDeferredPrompt(null)
      setVisible(false)
      setDismissForDays() // évite spam si l’utilisateur annule
    }
  }, [deferredPrompt, t.toastStarted, t.toastCancelled, t.toastError])

  /* ---------- Rendu ---------- */

  if (!visible) return null

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
            {t.title('TechPlay')}
          </h2>

        {!iosHelp ? (
          <p id="pwa-install-desc" className="mt-1 text-sm text-token-text/70">
            {t.desc}
          </p>
        ) : (
          <div id="pwa-install-desc" className="mt-1 text-sm text-token-text/80">
            <p className="text-token-text/70">{t.iosTitle}</p>
            <ol className="ml-4 list-decimal space-y-0.5">
              <li>
                {t.iosStep1}<strong>{t.iosShare}</strong>.
              </li>
              <li>
                {t.iosStep2}<strong>{t.iosAdd}</strong>.
              </li>
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
            aria-label={t.ariaLater}
          >
            {t.later}
          </Button>

          {!iosHelp && deferredPrompt ? (
            <Button
              variant="accent"
              size="sm"
              onClick={handleInstall}
              aria-label={t.ariaInstall}
            >
              {t.install}
            </Button>
          ) : (
            <Button
              variant="accent"
              size="sm"
              onClick={dismiss}
              aria-label="OK"
            >
              {t.ok}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
