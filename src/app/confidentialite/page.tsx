'use client'

import { useEffect, useState } from 'react'

type Prefs = {
  analytics: boolean
  ads: boolean
}

declare global {
  interface Window {
    tpConsentUpdate?: (payload: {
      analytics?: boolean
      ads?: boolean
      functionality?: boolean
      ad_user_data?: boolean
      ad_personalization?: boolean
    }) => void
  }
}

function readPrefs(): Prefs {
  try {
    return {
      analytics: localStorage.getItem('consent:analytics') === '1',
      ads: localStorage.getItem('consent:ads') === '1',
    }
  } catch {
    return { analytics: false, ads: false }
  }
}

function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem('consent:analytics', prefs.analytics ? '1' : '0')
    localStorage.setItem('consent:ads', prefs.ads ? '1' : '0')
    localStorage.setItem('consent:decided', '1')
  } catch {}
}

function applyConsent(prefs: Prefs) {
  try {
    window.dispatchEvent(new CustomEvent('tp:consent', { detail: prefs }))
  } catch {}

  try {
    window.tpConsentUpdate?.({
      analytics: prefs.analytics,
      ads: prefs.ads,
      functionality: true,
      ad_user_data: prefs.ads,
      ad_personalization: prefs.ads,
    })
  } catch {}
}

export default function ConfidentialitePage() {
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, ads: false })
  const [message, setMessage] = useState('')

  useEffect(() => {
    setPrefs(readPrefs())
  }, [])

  const save = () => {
    writePrefs(prefs)
    applyConsent(prefs)
    setMessage('Préférences mises à jour.')
  }

  const revoke = () => {
    const next: Prefs = { analytics: false, ads: false }
    setPrefs(next)
    writePrefs(next)
    applyConsent(next)
    setMessage('Consentement révoqué.')
  }

  return (
    <main className="container-app mx-auto max-w-3xl py-10" role="main" aria-labelledby="confidentialite-title">
      <div className="card p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <h1 id="confidentialite-title" className="mb-6 text-2xl font-extrabold tracking-tight text-[hsl(var(--text))] [letter-spacing:var(--heading-tracking)]">
          Politique de confidentialité
        </h1>

        <p className="text-[var(--step-0)] leading-relaxed text-token-text/80">
        Nous respectons votre vie privée. Les données collectées sur ce site sont utilisées pour le bon
        fonctionnement du service, la mesure d&apos;audience si vous l&apos;acceptez, et éventuellement la publicité.
      </p>

      <section
          className="mt-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 p-5"
          aria-labelledby="prefs-heading"
        >
          <h2 id="prefs-heading" className="mb-3 text-[15px] font-semibold">
            Préférences de confidentialité
          </h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4">
            <span className="text-[13px]">Mesure d&apos;audience (Analytics)</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[hsl(var(--accent))]"
              checked={prefs.analytics}
              onChange={(e) =>
                setPrefs((current) => ({
                  ...current,
                  analytics: e.target.checked,
                }))
              }
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="text-[13px]">Publicité</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[hsl(var(--accent))]"
              checked={prefs.ads}
              onChange={(e) =>
                setPrefs((current) => ({
                  ...current,
                  ads: e.target.checked,
                }))
              }
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={save}
                className="btn-premium rounded-full px-5 py-2.5 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                Enregistrer
              </button>

              <button
                type="button"
                onClick={revoke}
                className="btn-outline rounded-full px-5 py-2.5 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                Tout refuser
              </button>
            </div>

            <p id="prefs-message" className="sr-only" aria-live="polite">
              {message}
            </p>

            {message && (
              <p className="text-[13px] text-[hsl(var(--accent))]" aria-hidden>
                {message}
              </p>
            )}
          </div>
        </section>

        <p className="mt-6 text-[12px] text-token-text/70">
          Vous pouvez aussi gérer vos préférences via la bannière en bas de page lors de votre première visite.
        </p>
      </div>
    </main>
  )
}