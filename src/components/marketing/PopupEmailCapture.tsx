// src/components/marketing/PopupEmailCapture.tsx — FINAL
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  /** Délai avant apparition (ms) */
  delayMs?: number
  /** Jours pendant lesquels on ne réaffiche pas après dismiss/succès */
  ttlDays?: number
  /** Clé LS de persistance */
  dismissKey?: string
  /** Masquer sur ces routes */
  hideOnRoutes?: string[]
  /** Classe supplémentaire */
  className?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export default function PopupEmailCapture({
  delayMs = 15_000,
  ttlDays = 7,
  dismissKey = 'email_popup_dismiss_until',
  hideOnRoutes = ['/checkout', '/commande', '/success'],
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('') // screen reader
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const srRef = useRef<HTMLParagraphElement | null>(null)

  // Pré-remplir avec l'email du checkout si présent
  useEffect(() => {
    try {
      const saved = localStorage.getItem('checkout_email')
      if (saved && EMAIL_RE.test(saved)) setEmail(saved)
    } catch {}
  }, [])

  // Routes exclues
  const hiddenByRoute = useMemo(() => {
    if (typeof window === 'undefined') return false
    const p = window.location?.pathname || ''
    return hideOnRoutes.some((r) => p.startsWith(r))
  }, [hideOnRoutes])

  // Ne pas réafficher pendant ttl
  const isDismissed = () => {
    try {
      const raw = localStorage.getItem(dismissKey)
      const until = raw ? parseInt(raw, 10) : 0
      return Date.now() < until
    } catch {
      return false
    }
  }
  const persistDismiss = () => {
    try {
      const until = Date.now() + ttlDays * 24 * 60 * 60 * 1000
      localStorage.setItem(dismissKey, String(until))
    } catch {}
  }

  // Timer apparition
  useEffect(() => {
    if (hiddenByRoute || isDismissed()) return
    const t = setTimeout(() => setOpen(true), delayMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenByRoute, delayMs])

  // Focus & ESC
  useEffect(() => {
    if (!open) return
    // focus input à l’ouverture
    inputRef.current?.focus?.()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const announce = (msg: string) => {
    setStatus(msg)
    srRef.current && (srRef.current.textContent = msg)
  }

  const close = () => {
    setOpen(false)
    persistDismiss()
    announce('Fenêtre fermée')
  }

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    const valid = EMAIL_RE.test(email.trim())
    if (!valid) {
      setError('Adresse email invalide')
      inputRef.current?.focus()
      return
    }

    setLoading(true)
    setError(null)
    announce('Envoi en cours…')

    try {
      const res = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        cache: 'no-store',
        keepalive: true,
      })

      if (!res.ok) {
        const { error: msg } = await safeJson(res)
        throw new Error(msg || `Erreur ${res.status}`)
      }

      try {
        ;(window as any).dataLayer?.push({ event: 'email_capture_success' })
      } catch {}
      announce('Inscription réussie')
      persistDismiss()
      setOpen(false)
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
      announce('Échec de l’inscription')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const isFr =
    typeof document !== 'undefined'
      ? (document.documentElement.lang || 'fr').toLowerCase().startsWith('fr')
      : true

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm"
      onMouseDown={onBackdrop}
      role="presentation"
    >
      {/* SR live region */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-popup-title"
        aria-describedby="email-popup-desc"
        className={[
          'mx-3 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl outline-none',
          'dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800',
          className || '',
        ].join(' ')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="email-popup-title" className="text-lg font-bold">
            {isFr ? 'Restez informé' : 'Stay in the loop'}
          </h3>
          <button
            onClick={close}
            aria-label={isFr ? 'Fermer' : 'Close'}
            className="rounded p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            ✕
          </button>
        </div>

        <p id="email-popup-desc" className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {isFr
            ? 'Recevez nos nouveautés et offres (pas de spam).'
            : 'Get product updates and offers (no spam).'}
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <input
            ref={inputRef}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className={[
              'w-full rounded-lg border px-3 py-2 text-sm',
              'bg-white dark:bg-zinc-800',
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-accent focus:outline-none',
            ].join(' ')}
            placeholder={isFr ? 'Votre email' : 'Your email'}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'email-popup-error' : undefined}
            maxLength={120}
          />

          {error && (
            <p id="email-popup-error" className="text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[hsl(var(--accent))] py-2 font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
            aria-busy={loading ? 'true' : 'false'}
          >
            {loading ? (isFr ? 'Envoi…' : 'Sending…') : isFr ? "S'inscrire" : 'Subscribe'}
          </button>

          <button
            type="button"
            onClick={close}
            className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            {isFr ? 'Non merci' : 'No thanks'}
          </button>

          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            {isFr ? 'En vous inscrivant, vous acceptez notre ' : 'By subscribing you agree to our '}
            <a className="underline" href="/confidentialite">
              {isFr ? 'politique de confidentialité' : 'privacy policy'}
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------ Helpers ------------------------------ */
async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}
