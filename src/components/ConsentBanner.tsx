// src/components/ConsentBanner.tsx — Consent Mode v2 (compact, accessible) — FINAL+++
// - Défaut: denied (déjà posé dans <head>), MAJ via tp:consent + __applyConsent
// - Stocke booleans: localStorage(consent:analytics, consent:ads, consent:decided)
// - Bouton "Paramètres" avec 2 toggles (Analytics / Publicité)
// - Émet aussi des events GTM (dataLayer) pour audit
// - API globale: window.tpOpenConsent() / window.tpResetConsent()

'use client'

import { useEffect, useRef, useState } from 'react'

type Prefs = {
  analytics: boolean
  ads: boolean
  functionality: boolean
}

// ---------- storage helpers ----------
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

// ---------- syncing helpers ----------
function pushDL(event: string, detail: Record<string, any>) {
  try {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({ event, ...detail })
  } catch {}
}

// émet CustomEvent + utilise l’API exposée par Analytics.tsx + <head>.__applyConsent
function applyConsent(p: Prefs) {
  try {
    window.dispatchEvent(new CustomEvent('tp:consent', { detail: p }))
  } catch {}
  try {
    ;(window as any).tpConsentUpdate?.(p)
  } catch {}
  try {
    ;(window as any).__applyConsent?.({
      analytics_storage: p.analytics ? 'granted' : 'denied',
      ad_storage: p.ads ? 'granted' : 'denied',
      ad_user_data: p.ads ? 'granted' : 'denied',
      ad_personalization: p.ads ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    })
  } catch {}
}

// ---------- Component ----------
export default function ConsentBanner() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, ads: false, functionality: true })
  const [show, setShow] = useState(false)
  const firstToggleRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Respect DNT: si activé, on n’affiche rien (on garde denied)
    const dnt =
      (navigator as any).doNotTrack === '1' ||
      (window as any).doNotTrack === '1' ||
      (navigator as any).msDoNotTrack === '1'

    if (dnt || readDecided()) return
    setPrefs(readPrefs())
    setShow(true)
  }, [])

  // API globale pour rouvrir / réinitialiser
  useEffect(() => {
    ;(window as any).tpOpenConsent = () => {
      setPrefs(readPrefs())
      setOpen(true)
      setShow(true)
      writeDecided(false)
      setTimeout(() => firstToggleRef.current?.focus(), 0)
    }
    ;(window as any).tpResetConsent = () => {
      try {
        localStorage.removeItem('consent:analytics')
        localStorage.removeItem('consent:ads')
        localStorage.removeItem('consent:decided')
      } catch {}
      // repasse en denied via applyConsent(false)
      const p: Prefs = { analytics: false, ads: false, functionality: true }
      applyConsent(p)
      pushDL('consent_reset', { source: 'user' })
      ;(window as any).tpOpenConsent?.()
    }
    return () => {
      delete (window as any).tpOpenConsent
      delete (window as any).tpResetConsent
    }
  }, [])

  useEffect(() => {
    if (!show) return
    // empêche la page de "sauter" sur mobile
    document.documentElement.classList.add('consent-banner-open')
    return () => document.documentElement.classList.remove('consent-banner-open')
  }, [show])

  if (!show) return null

  const acceptAll = () => {
    const p: Prefs = { analytics: true, ads: true, functionality: true }
    savePrefs(p)
    applyConsent(p)
    writeDecided(true)
    pushDL('consent_accept_all', { analytics: 1, ads: 1 })
    setShow(false)
  }

  const refuseAll = () => {
    const p: Prefs = { analytics: false, ads: false, functionality: true }
    savePrefs(p)
    applyConsent(p)
    writeDecided(true)
    pushDL('consent_reject_all', { analytics: 0, ads: 0 })
    setShow(false)
  }

  const saveSelected = () => {
    const p = { ...prefs, functionality: true }
    savePrefs(p)
    applyConsent(p)
    writeDecided(true)
    pushDL('consent_save_selected', { analytics: p.analytics ? 1 : 0, ads: p.ads ? 1 : 0 })
    setShow(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tp-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-4xl rounded-t-2xl border border-token-border bg-token-surface/95 px-4 py-4 shadow-2xl backdrop-blur sm:rounded-2xl sm:bottom-6 sm:px-6 sm:py-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex-1">
          <h2 id="tp-consent-title" className="text-base font-bold">
            Votre confidentialité chez TechPlay
          </h2>
          <p className="mt-1 text-sm text-token-text/70">
            On utilise des cookies pour mesurer l’audience (analytics) et, si vous l’acceptez, pour la
            publicité. Vous pourrez changer d’avis à tout moment dans les paramètres.
          </p>

          {/* Panneau paramètres */}
          {open && (
            <div className="mt-3 grid gap-2 rounded-xl border border-token-border bg-token-surface/70 p-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm">
                  Mesure d’audience <span className="text-xs text-token-text/60">(recommandé)</span>
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
                <span className="text-sm">Publicité</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[hsl(var(--accent))]"
                  checked={prefs.ads}
                  onChange={(e) => setPrefs((p) => ({ ...p, ads: e.target.checked }))}
                />
              </label>
              <p className="mt-1 text-xs text-token-text/60">
                Fonctionnels & sécurité sont toujours actifs.
              </p>
            </div>
          )}

          <a
            href="/confidentialite"
            className="mt-2 inline-block text-xs text-[hsl(var(--accent))] underline underline-offset-4"
          >
            En savoir plus
          </a>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
          {!open ? (
            <>
              <button
                type="button"
                onClick={acceptAll}
                className="w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              >
                Tout accepter
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(true)
                  setTimeout(() => firstToggleRef.current?.focus(), 0)
                }}
                className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-2 text-sm font-semibold hover:shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              >
                Paramètres
              </button>
              <button
                type="button"
                onClick={refuseAll}
                className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-2 text-sm font-semibold hover:shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              >
                Tout refuser
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={saveSelected}
                className="w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)]"
              >
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-2 text-sm font-semibold hover:shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.30)]"
              >
                Retour
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
