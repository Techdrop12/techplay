// src/components/checkout/CheckoutForm.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createCheckoutSession, buildCheckoutItemsFromCart } from '@/lib/checkout'
import { event as gaEvent } from '@/lib/ga'
import { toast } from 'react-hot-toast'
import { useCart } from '@/hooks/useCart'

type FormErrors = {
  email?: string
  address?: string
}

const LS_EMAIL_KEY = 'checkout_email'
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test((v || '').trim())
const isAddress = (v: string) => (v || '').trim().length >= 6

export default function CheckoutForm() {
  const { cart } = useCart()
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<string>('') // live region
  const [hp, setHp] = useState('') // honeypot
  const [online, setOnline] = useState(true)

  const emailRef = useRef<HTMLInputElement | null>(null)
  const addressRef = useRef<HTMLInputElement | null>(null)
  const srRef = useRef<HTMLParagraphElement | null>(null)
  const emailDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTestHelp = process.env.NEXT_PUBLIC_STRIPE_TEST === '1' || process.env.NEXT_PUBLIC_ENV === 'dev'

  // Prefill depuis LS
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_EMAIL_KEY)
      if (saved && isEmail(saved)) setEmail(saved)
    } catch {}
  }, [])

  // Écoute online/offline
  useEffect(() => {
    const upd = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine)
    upd()
    window.addEventListener('online', upd)
    window.addEventListener('offline', upd)
    return () => {
      window.removeEventListener('online', upd)
      window.removeEventListener('offline', upd)
    }
  }, [])

  // Sauvegarde email (debounce)
  useEffect(() => {
    if (emailDebounce.current) clearTimeout(emailDebounce.current)
    emailDebounce.current = setTimeout(() => {
      try {
        if (isEmail(email)) localStorage.setItem(LS_EMAIL_KEY, email)
      } catch {}
    }, 400)
    return () => {
      if (emailDebounce.current) clearTimeout(emailDebounce.current)
    }
  }, [email])

  // SR helper
  const announce = (msg: string) => {
    setStatus(msg)
    if (srRef.current) srRef.current.textContent = msg
  }

  // Validation instantanée (utile pour l’état visuel)
  const emailValid = useMemo(() => isEmail(email), [email])
  const addressValid = useMemo(() => isAddress(address), [address])

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!emailValid) next.email = 'Adresse email invalide'
    if (!addressValid) next.address = 'Adresse trop courte'
    setErrors(next)
    if (next.email) emailRef.current?.focus()
    else if (next.address) addressRef.current?.focus()
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (hp) return // bot
    if (!online) {
      announce('Vous êtes hors ligne. Réessayez lorsque la connexion revient.')
      try { toast.error('Hors ligne – réessayez plus tard') } catch {}
      return
    }
    if (!validate()) return

    setLoading(true)
    setStatus('')

    try {
      // Analytics (submit)
      try {
        gaEvent?.({ action: 'checkout_submit', category: 'engagement', label: 'checkout_form' })
        gaEvent?.({
          action: 'add_payment_info',
          category: 'ecommerce',
          label: 'stripe',
          value: 1,
          payment_type: 'stripe',
        } as any)
      } catch {}

      announce('Création de la session de paiement…')

      // Passe les items du panier à l’API (mieux pour reçus / back-office / emails)
      const items = buildCheckoutItemsFromCart(Array.isArray(cart) ? cart : [])

      const session = await createCheckoutSession({
        email,
        address,
        items,
        currency: 'EUR',
      })

      if (session?.url) {
        try { toast('Redirection vers le paiement…', { icon: '💳' }) } catch {}
        announce('Redirection vers Stripe')
        window.location.href = session.url
        return
      }
      throw new Error('Session invalide')
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('Checkout error:', err)
      announce('Une erreur est survenue. Réessayez.')
      try { toast.error("Impossible de démarrer le paiement pour le moment.") } catch {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-labelledby="checkout-form-title">
      {/* SR live region */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <h3 id="checkout-form-title" className="text-lg font-semibold text-gray-900 dark:text-white">
        Coordonnées
      </h3>

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
          autoCapitalize="none"
          autoCorrect="off"
          className={[
            'w-full border px-3 py-2 rounded-lg text-sm',
            'bg-white dark:bg-zinc-800',
            errors.email
              ? 'border-red-500 focus:ring-red-500'
              : emailValid
                ? 'border-emerald-400 focus:ring-emerald-500'
                : 'border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-accent',
          ].join(' ')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
          }}
          required
          autoComplete="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          placeholder="vous@exemple.com"
          maxLength={120}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
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
          autoCapitalize="words"
          className={[
            'w-full border px-3 py-2 rounded-lg text-sm',
            'bg-white dark:bg-zinc-800',
            errors.address
              ? 'border-red-500 focus:ring-red-500'
              : addressValid
                ? 'border-emerald-400 focus:ring-emerald-500'
                : 'border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-accent',
          ].join(' ')}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            if (errors.address) setErrors((p) => ({ ...p, address: undefined }))
          }}
          required
          autoComplete="street-address"
          aria-required="true"
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? 'address-error' : undefined}
          placeholder="12 rue des Fleurs, 75000 Paris"
          maxLength={160}
        />
        {errors.address && (
          <p id="address-error" className="mt-1 text-xs text-red-600">
            {errors.address}
          </p>
        )}
      </div>

      {/* Honeypot invisible */}
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
        disabled={loading || !online}
        aria-busy={loading ? 'true' : 'false'}
        aria-live="polite"
      >
        {loading ? 'Redirection…' : online ? 'Payer maintenant' : 'Hors ligne'}
      </button>

      {/* Hints & legal */}
      {showTestHelp && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Mode test activé&nbsp;: utilisez une carte <code>4242&nbsp;4242&nbsp;4242&nbsp;4242</code>,
          n’importe quelle date future et CVC.
        </p>
      )}

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        En continuant, vous acceptez nos <a className="underline" href="/cgv">CGV</a> et notre{' '}
        <a className="underline" href="/confidentialite">politique de confidentialité</a>.
      </p>
    </form>
  )
}
