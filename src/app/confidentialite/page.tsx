// src/app/confidentialite/page.tsx — FINAL (page interactive pour gérer le consentement)
'use client'

import { useEffect, useState } from 'react'

type Prefs = { analytics: boolean; ads: boolean }

function readPrefs(): Prefs {
  try {
    return {
      analytics: (localStorage.getItem('consent:analytics') || '0') === '1',
      ads: (localStorage.getItem('consent:ads') || '0') === '1',
    }
  } catch { return { analytics: false, ads: false } }
}

function writePrefs(p: Prefs) {
  try {
    localStorage.setItem('consent:analytics', p.analytics ? '1' : '0')
    localStorage.setItem('consent:ads', p.ads ? '1' : '0')
    localStorage.setItem('consent:decided', '1')
  } catch {}
}

function applyConsent(p: Prefs) {
  try { window.dispatchEvent(new CustomEvent('tp:consent', { detail: p })) } catch {}
  try { ;(window as any).tpConsentUpdate?.({ analytics: p.analytics, ads: p.ads, functionality: true }) } catch {}
}

export default function ConfidentialitePage() {
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, ads: false })

  useEffect(() => { setPrefs(readPrefs()) }, [])

  const save = () => {
    const next = { ...prefs }
    writePrefs(next)
    applyConsent(next)
    alert('Préférences mises à jour.')
  }

  const revoke = () => {
    const next = { analytics: false, ads: false }
    writePrefs(next)
    applyConsent(next)
    alert('Consentement révoqué.')
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Politique de confidentialité</h1>
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
        Nous respectons votre vie privée. Les données collectées sur ce site sont utilisées pour le bon
        fonctionnement du service, la mesure d’audience (si vous l’acceptez), et éventuellement la publicité.
      </p>

      <section className="mt-8 rounded-xl border border-token-border p-4">
        <h2 className="font-semibold mb-3">Préférences de confidentialité</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Mesure d’audience (Analytics)</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[hsl(var(--accent))]"
              checked={prefs.analytics}
              onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Publicité</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[hsl(var(--accent))]"
              checked={prefs.ads}
              onChange={(e) => setPrefs((p) => ({ ...p, ads: e.target.checked }))}
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              className="rounded-lg bg-[hsl(var(--accent))] text-white px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              Enregistrer
            </button>
            <button
              onClick={revoke}
              className="rounded-lg border border-token-border px-4 py-2 text-sm hover:bg-token-surface/60"
            >
              Tout refuser
            </button>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        Vous pouvez aussi gérer vos préférences via la bannière en bas de page lors de votre première visite.
      </p>
    </main>
  )
}
