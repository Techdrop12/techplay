// src/components/checkout/CheckoutForm.tsx — PREMIUM+ (a11y/UX/Perf/Tracking)
// - UX/a11y : SR live, focus management, hints, fieldset disabled, role=alert, ids stables
// - Perf    : pas d’objets recréés inutilement, LS + QS safe
// - Tracking: GA4 + dataLayer (événements sémantiques), toasts cohérents
// - Flux    : Stripe Checkout via createCheckoutSession (pas de Payment Element)
'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createCheckoutSession } from '@/lib/checkout'
import { toast } from 'react-hot-toast'
// GA: on tolère le nom d’export chez toi (event/logEvent) sans casser le build
import { event as gaEvent } from '@/lib/ga'

type FormErrors = { email?: string; address?: string }

const LS_EMAIL_KEY = 'checkout_email'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

const isEmail = (v: string) => EMAIL_RE.test(String(v || '').trim())
const isAddress = (v: string) => String(v || '').trim().length >= 6

// Helper ARIA pour composer plusieurs ids
const joinIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ')

/** Icône carte bancaire (SVG, sans emoji) */
function IconCard({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 6.5C3 5.12 4.12 4 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Z"
        fill="currentColor"
        opacity="0.12"
      />
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="5" y="9" width="14" height="2.25" rx="1" fill="currentColor" />
      <rect x="5" y="14" width="5.5" height="1.75" rx="0.9" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export default function CheckoutForm() {
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<string>('') // SR live region
  const [hp, setHp] = useState('') // honeypot

  const formRef = useRef<HTMLFormElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const addressRef = useRef<HTMLInputElement | null>(null)
  const srRef = useRef<HTMLParagraphElement | null>(null)

  // Ids stables pour hints / erreurs
  const emailHintId = useId()
  const addressHintId = useId()
  const srStatusId = useId()

  /* ----------------------------- Prefill email ---------------------------- */
  useEffect(() => {
    try {
      // 1) Querystring ?email=
      const qsEmail = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('email')
        : null
      if (qsEmail && isEmail(qsEmail)) {
        setEmail(qsEmail)
        try {
          gaEvent?.({ action: 'checkout_prefill_email_qs', category: 'checkout', label: 'querystring' })
          ;(window as any).dataLayer?.push({ event: 'checkout_prefill_email_qs' })
        } catch {}
        return
      }

      // 2) LocalStorage
      const saved = localStorage.getItem(LS_EMAIL_KEY)
      if (saved && isEmail(saved)) {
        setEmail(saved)
        try {
          gaEvent?.({ action: 'checkout_prefill_email_ls', category: 'checkout', label: 'localstorage' })
          ;(window as any).dataLayer?.push({ event: 'checkout_prefill_email_ls' })
        } catch {}
      }
    } catch {}
  }, [])

  const announce = useCallback((msg: string) => {
    setStatus(msg)
    if (srRef.current) srRef.current.textContent = msg
  }, [])

  const validate = useCallback((): boolean => {
    const next: FormErrors = {}
    if (!isEmail(email)) next.email = 'Adresse email invalide'
    if (!isAddress(address)) next.address = 'Adresse trop courte'
    setErrors(next)

    // focus le premier champ en erreur
    if (next.email) {
      emailRef.current?.focus()
      return false
    }
    if (next.address) {
      addressRef.current?.focus()
      return false
    }
    return true
  }, [email, address])

  const track = useCallback((name: string, payload?: Record<string, unknown>) => {
    try {
      gaEvent?.({ action: name, category: 'checkout', label: 'checkout_form', ...payload })
    } catch {}
    try {
      ;(window as any).dataLayer?.push({ event: name, ...payload })
    } catch {}
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (loading) return
      if (hp) return // bot
      if (!validate()) return

      setLoading(true)
      setStatus('')
      formRef.current?.setAttribute('aria-busy', 'true')

      try {
        track('checkout_submit')

        // Sauvegarde opportuniste de l’email
        try { localStorage.setItem(LS_EMAIL_KEY, email) } catch {}

        announce('Création de la session de paiement…')
        const session = await createCheckoutSession({ email, address })

        if (session?.url) {
          toast('Redirection vers le paiement…', {
            icon: <IconCard className="text-[hsl(var(--accent))]" />,
          })
          announce('Redirection vers Stripe')
          track('checkout_redirect', { provider: 'stripe_checkout' })
          window.location.href = session.url
          return
        }
        throw new Error('Session invalide')
      } catch (err: any) {
        console.error('[Checkout] error:', err)
        const msg = err?.message || 'Une erreur est survenue. Réessayez.'
        announce(msg)
        toast.error('Une erreur est survenue. Veuillez réessayer.')
        track('checkout_error', { message: msg })
      } finally {
        setLoading(false)
        formRef.current?.setAttribute('aria-busy', 'false')
      }
    },
    [address, email, hp, loading, validate, announce, track]
  )

  /* -------------------------- Micro UX améliorations ---------------------- */
  // Enregistrer l’email au blur (en plus du submit)
  const onEmailBlur = useCallback(() => {
    if (isEmail(email)) {
      try { localStorage.setItem(LS_EMAIL_KEY, email) } catch {}
    }
  }, [email])

  // Appuyer sur Enter dans l’email quand il est valide → focus adresse
  const onEmailKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isEmail(email)) {
      e.preventDefault()
      addressRef.current?.focus()
    }
  }, [email])

  const emailDescribedBy = joinIds(errors.email ? 'email-error' : undefined, emailHintId)
  const addressDescribedBy = joinIds(errors.address ? 'address-error' : undefined, addressHintId)

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-labelledby="checkout-form-title"
      aria-describedby={srStatusId}
      aria-live="polite"
    >
      {/* SR live region */}
      <p
        id={srStatusId}
        ref={srRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </p>

      <h3 id="checkout-form-title" className="text-lg font-semibold text-gray-900 dark:text-white">
        Coordonnées
      </h3>

      {/* On désactive tous les champs pendant le chargement */}
      <fieldset disabled={loading} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            enterKeyHint="next"
            className={[
              'w-full border px-3 py-2 rounded-lg text-sm',
              'bg-white dark:bg-zinc-800',
              'focus:outline-none focus:ring-2',
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-zinc-700 focus:ring-accent',
            ].join(' ')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
            }}
            onBlur={onEmailBlur}
            onKeyDown={onEmailKeyDown}
            required
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={emailDescribedBy || undefined}
            placeholder="vous@exemple.com"
            maxLength={120}
            data-gtm="checkout_email_input"
          />
          <p id={emailHintId} className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Nous vous enverrons la confirmation et la facture à cette adresse.
          </p>
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600" role="alert" aria-live="assertive">
              {errors.email}
            </p>
          )}
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Adresse de livraison
          </label>
          <input
            ref={addressRef}
            id="address"
            name="street-address"
            type="text"
            className={[
              'w-full border px-3 py-2 rounded-lg text-sm',
              'bg-white dark:bg-zinc-800',
              'focus:outline-none focus:ring-2',
              errors.address
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-zinc-700 focus:ring-accent',
            ].join(' ')}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              if (errors.address) setErrors((p) => ({ ...p, address: undefined }))
            }}
            required
            autoComplete="shipping street-address"
            aria-required="true"
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={addressDescribedBy || undefined}
            placeholder="12 rue des Fleurs, 75000 Paris"
            maxLength={160}
            data-gtm="checkout_address_input"
          />
          <p id={addressHintId} className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Numéro et libellé de rue, code postal, ville.
          </p>
          {errors.address && (
            <p id="address-error" className="mt-1 text-xs text-red-600" role="alert" aria-live="assertive">
              {errors.address}
            </p>
          )}
        </div>

        {/* Honeypot invisible (anti-bot) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Site web</label>
          <input
            id="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4 rounded-xl shadow transition disabled:opacity-60 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          disabled={loading}
          aria-busy={loading ? 'true' : 'false'}
          data-gtm="checkout_submit_btn"
        >
          {loading ? 'Redirection…' : 'Payer maintenant'}
        </button>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          En continuant, vous acceptez nos <a className="underline" href="/cgv">CGV</a> et notre{' '}
          <a className="underline" href="/confidentialite">politique de confidentialité</a>.
        </p>
      </fieldset>
    </form>
  )
}
