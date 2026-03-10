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
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Politique de confidentialité</h1>

      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        Nous respectons votre vie privée. Les données collectées sur ce site sont utilisées pour le bon
        fonctionnement du service, la mesure d’audience si vous l’acceptez, et éventuellement la publicité.
      </p>

      <section className="mt-8 rounded-xl border border-token-border p-4">
        <h2 className="mb-3 font-semibold">Préférences de confidentialité</h2>

        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4">
            <span>Mesure d’audience (Analytics)</span>
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
            <span>Publicité</span>
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
              className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Enregistrer
            </button>

            <button
              type="button"
              onClick={revoke}
              className="rounded-lg border border-token-border px-4 py-2 text-sm hover:bg-token-surface/60"
            >
              Tout refuser
            </button>
          </div>

          <p className="sr-only" aria-live="polite">
            {message}
          </p>

          {message && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </p>
          )}
        </div>
      </section>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Vous pouvez aussi gérer vos préférences via la bannière en bas de page lors de votre première visite.
      </p>
    </main>
  )
}