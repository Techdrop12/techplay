// src/components/ConsentBanner.tsx — UX/A11y + Consent Mode v2 bridge + i18n FR/EN
'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

declare global {
  interface Window {
    tpOpenConsent?: () => void
    tpResetConsent?: () => void
    tpConsentUpdate?: (p: {
      analytics?: boolean
      ads?: boolean
      ad_user_data?: boolean
      ad_personalization?: boolean
      functionality?: boolean
    }) => void
    __applyConsent?: (update: Record<string, 'granted' | 'denied'>) => void
  }
}

const DISABLED = (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED || '').toLowerCase() === 'true'

type Prefs = { analytics: boolean; ads: boolean; functionality: boolean }

function readDecided(): boolean {
  try { return localStorage.getItem('consent:decided') === '1' } catch { return false }
}
function writeDecided(v: boolean) {
  try { localStorage.setItem('consent:decided', v ? '1' : '0') } catch {}
}
function readPrefs(): Prefs {
  try {
    return {
      analytics: (localStorage.getItem('consent:analytics') || '0') === '1',
      ads: (localStorage.getItem('consent:ads') || '0') === '1',
      functionality: true,
    }
  } catch {
    return { analytics: false, ads: false, functionality: true }
  }
}
function savePrefs(p: Prefs) {
  try {
    localStorage.setItem('consent:analytics', p.analytics ? '1' : '0')
    localStorage.setItem('consent:ads', p.ads ? '1' : '0')
  } catch {}
}

function pushDL(event: string, detail: Record<string, any>) {
  try {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({ event, ...detail })
  } catch {}
}

function applyConsent(p: Prefs) {
  // 1) Broadcast app-wide (Tracking, MetaPixel…)
  try { window.dispatchEvent(new CustomEvent('tp:consent', { detail: p })) } catch {}
  // 2) API de Analytics.tsx (met à jour GA Consent Mode + storage miroir)
  try { window.tpConsentUpdate?.(p) } catch {}
  // 3) Fallback universel si défini (Root layout/head)
  try {
    window.__applyConsent?.({
      analytics_storage: p.analytics ? 'granted' : 'denied',
      ad_storage: p.ads ? 'granted' : 'denied',
      ad_user_data: p.ads ? 'granted' : 'denied',
      ad_personalization: p.ads ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    })
  } catch {}
}

/** i18n local minimal (auto depuis l’URL) */
const STR = {
  fr: {
    title: 'Votre confidentialité chez TechPlay',
    desc:
      'Nous utilisons des cookies pour mesurer l’audience et, si vous l’acceptez, pour la publicité. ' +
      'Vous pourrez changer d’avis à tout moment dans les paramètres.',
    more: 'En savoir plus',
    audience: 'Mesure d’audience',
    recommended: '(recommandé)',
    ads: 'Publicité',
    alwaysOn: 'Fonctionnels & sécurité sont toujours actifs.',
    acceptAll: 'Tout accepter',
    settings: 'Paramètres',
    refuseAll: 'Tout refuser',
    save: 'Sauvegarder',
    back: 'Retour',
  },
  en: {
    title: 'Your privacy at TechPlay',
    desc:
      'We use cookies to measure audience and, if you accept, for advertising. ' +
      'You can change your preferences at any time in the settings.',
    more: 'Learn more',
    audience: 'Analytics',
    recommended: '(recommended)',
    ads: 'Advertising',
    alwaysOn: 'Functional & security cookies are always active.',
    acceptAll: 'Accept all',
    settings: 'Settings',
    refuseAll: 'Reject all',
    save: 'Save',
    back: 'Back',
  },
} as const

export default function ConsentBanner() {
  if (DISABLED) return null

  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, ads: false, functionality: true })
  const [show, setShow] = useState(false)
  const firstToggleRef = useRef<HTMLInputElement | null>(null)

  const loc = useMemo(() => getCurrentLocale(), []) as 'fr' | 'en'
  const t = STR[loc]
  const privacyHref = useMemo(() => {
    // adapte la route selon la locale si tu as une page en EN
    const base = loc === 'en' ? '/privacy' : '/confidentialite'
    return localizePath(base, loc)
  }, [loc])

  useEffect(() => {
    const dnt =
      (navigator as any).doNotTrack === '1' ||
      (window as any).doNotTrack === '1' ||
      (navigator as any).msDoNotTrack === '1'
    if (dnt || readDecided()) return
    setPrefs(readPrefs())
    setShow(true)
  }, [])

  // API globale
  useEffect(() => {
    window.tpOpenConsent = () => {
      setPrefs(readPrefs()); setOpen(true); setShow(true); writeDecided(false)
      setTimeout(() => firstToggleRef.current?.focus(), 0)
    }
    window.tpResetConsent = () => {
      try {
        localStorage.removeItem('consent:analytics')
        localStorage.removeItem('consent:ads')
        localStorage.removeItem('consent:decided')
      } catch {}
      const p: Prefs = { analytics: false, ads: false, functionality: true }
      applyConsent(p); pushDL('consent_reset', { source: 'user' })
      window.tpOpenConsent?.()
    }
    return () => { delete window.tpOpenConsent; delete window.tpResetConsent }
  }, [])

  // body lock léger (pour éviter saut lors de l’apparition)
  useEffect(() => {
    if (!show) return
    document.documentElement.classList.add('consent-banner-open')
    return () => document.documentElement.classList.remove('consent-banner-open')
  }, [show])

  // Esc pour fermer le panneau paramètres
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!show) return null

  const acceptAll = () => {
    const p: Prefs = { analytics: true, ads: true, functionality: true }
    savePrefs(p); applyConsent(p); writeDecided(true); pushDL('consent_accept_all', { analytics: 1, ads: 1 }); setShow(false)
  }
  const refuseAll = () => {
    const p: Prefs = { analytics: false, ads: false, functionality: true }
    savePrefs(p); applyConsent(p); writeDecided(true); pushDL('consent_reject_all', { analytics: 0, ads: 0 }); setShow(false)
  }
  const saveSelected = () => {
    const p = { ...prefs, functionality: true }
    savePrefs(p); applyConsent(p); writeDecided(true)
    pushDL('consent_save_selected', { analytics: p.analytics ? 1 : 0, ads: p.ads ? 1 : 0 })
    setShow(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tp-consent-title"
      aria-describedby="tp-consent-desc"
      data-nosnippet
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-4xl rounded-t-2xl border border-token-border bg-token-surface/95 px-4 py-4 shadow-2xl backdrop-blur sm:rounded-2xl sm:bottom-6 sm:px-6 sm:py-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex-1">
          <h2 id="tp-consent-title" className="text-base font-bold">{t.title}</h2>
          <p id="tp-consent-desc" className="mt-1 text-sm text-token-text/70">
            {t.desc}
          </p>

          {open && (
            <div className="mt-3 grid gap-2 rounded-xl border border-token-border bg-token-surface/70 p-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm">
                  {t.audience} <span className="text-xs text-token-text/60">{t.recommended}</span>
                </span>
                <input
                  ref={firstToggleRef}
                  type="checkbox"
                  className="h-5 w-5 accent-[hsl(var(--accent))]"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm">{t.ads}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[hsl(var(--accent))]"
                  checked={prefs.ads}
                  onChange={(e) => setPrefs((p) => ({ ...p, ads: e.target.checked }))}
                />
              </label>
              <p className="mt-1 text-xs text-token-text/60">{t.alwaysOn}</p>
            </div>
          )}

          <a href={privacyHref} className="mt-2 inline-block text-xs text-[hsl(var(--accent))] underline underline-offset-4">
            {t.more}
          </a>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
          {!open ? (
            <>
              <button type="button" onClick={acceptAll}
                className="w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]">
                {t.acceptAll}
              </button>
              <button type="button" onClick={() => { setOpen(true); setTimeout(() => firstToggleRef.current?.focus(), 0) }}
                className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-2 text-sm font-semibold hover:shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]">
                {t.settings}
              </button>
              <button type="button" onClick={refuseAll}
                className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-2 text-sm font-semibold hover:shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]">
                {t.refuseAll}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={saveSelected}
                className="w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]">
                {t.save}
              </button>
              <button type="button" onClick={() => setOpen(false)}
                className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-2 text-sm font-semibold hover:shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]">
                {t.back}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
