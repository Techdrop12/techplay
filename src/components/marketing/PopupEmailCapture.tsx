'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  delayMs?: number
  ttlDays?: number
  dismissKey?: string
  hideOnRoutes?: string[]
  className?: string
}

type WelcomeResponse = {
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

export default function PopupEmailCapture({
  delayMs = 15_000,
  ttlDays = 7,
  dismissKey = 'email_popup_dismiss_until',
  hideOnRoutes = ['/checkout', '/commande', '/success'],
  className,
}: Props) {
  const pathname = usePathname() || ''
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const inputRef = useRef<HTMLInputElement | null>(null)
  const srRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('checkout_email')
      if (saved && EMAIL_RE.test(saved)) setEmail(saved)
    } catch {}
  }, [])

  const hiddenByRoute = useMemo(
    () => hideOnRoutes.some((route) => pathname.startsWith(route)),
    [hideOnRoutes, pathname]
  )

  const isDismissed = useCallback(() => {
    try {
      const raw = localStorage.getItem(dismissKey)
      const until = raw ? parseInt(raw, 10) : 0
      return Date.now() < until
    } catch {
      return false
    }
  }, [dismissKey])

  const persistDismiss = useCallback(() => {
    try {
      const until = Date.now() + ttlDays * 24 * 60 * 60 * 1000
      localStorage.setItem(dismissKey, String(until))
    } catch {}
  }, [dismissKey, ttlDays])

  const announce = useCallback((msg: string) => {
    setStatus(msg)
    if (srRef.current) srRef.current.textContent = msg
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    persistDismiss()
    announce('Fenêtre fermée')
  }, [announce, persistDismiss])

  useEffect(() => {
    if (hiddenByRoute || isDismissed()) return

    const timer = window.setTimeout(() => setOpen(true), delayMs)
    return () => clearTimeout(timer)
  }, [hiddenByRoute, isDismissed, delayMs])

  useEffect(() => {
    if (!open) return

    inputRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
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
        body: JSON.stringify({ email: value }),
        cache: 'no-store',
        keepalive: true,
      })

      if (!res.ok) {
        const body = await safeJson(res)
        throw new Error(body.error || `Erreur ${res.status}`)
      }

      try {
        window.dataLayer?.push({ event: 'email_capture_success' })
      } catch {}

      announce('Inscription réussie')
      persistDismiss()
      setOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
      announce("Échec de l'inscription")
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
      <p ref={srRef} className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div
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
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-accent focus:outline-none',
            ].join(' ')}
            placeholder={isFr ? 'Votre email' : 'Your email'}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            aria-invalid={Boolean(error)}
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

async function safeJson(res: Response): Promise<WelcomeResponse> {
  try {
    const data: unknown = await res.json()
    return typeof data === 'object' && data !== null ? (data as WelcomeResponse) : {}
  } catch {
    return {}
  }
}