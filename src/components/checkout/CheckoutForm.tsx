// src/components/checkout/CheckoutForm.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckoutSession } from '@/lib/checkout'
import { event } from '@/lib/ga'
import { toast } from 'react-hot-toast'

type FormErrors = {
  email?: string
  address?: string
}

const LS_EMAIL_KEY = 'checkout_email'

const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim())

const isAddress = (v: string) => v.trim().length >= 6

export default function CheckoutForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<string>('') // live region
  const [hp, setHp] = useState('') // honeypot

  const emailRef = useRef<HTMLInputElement | null>(null)
  const addressRef = useRef<HTMLInputElement | null>(null)
  const srRef = useRef<HTMLParagraphElement | null>(null)

  // Prefill depuis LS
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_EMAIL_KEY)
      if (saved && isEmail(saved)) setEmail(saved)
    } catch {}
  }, [])

  // Annonce SR helper
  const announce = (msg: string) => {
    setStatus(msg)
    if (srRef.current) srRef.current.textContent = msg
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!isEmail(email)) next.email = 'Adresse email invalide'
    if (!isAddress(address)) next.address = 'Adresse trop courte'
    setErrors(next)
    if (next.email) emailRef.current?.focus()
    else if (next.address) addressRef.current?.focus()
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (hp) return // bot
    if (!validate()) return

    setLoading(true)
    setStatus('')
    try {
      // Analytics
      event({ action: 'checkout_submit', category: 'engagement', label: 'checkout_form' })

      // Sauvegarde email pour confort
      try { localStorage.setItem(LS_EMAIL_KEY, email) } catch {}

      announce('Création de la session de paiement…')
      const session = await createCheckoutSession({ email, address })

      if (session?.url) {
        toast('Redirection vers le paiement…', { icon: '💳' })
        announce('Redirection vers Stripe')
        window.location.href = session.url
        return
      }
      throw new Error('Session invalide')
    } catch (err) {
      console.error('Checkout error:', err)
      setErrors((prev) => ({ ...prev }))
      announce('Une erreur est survenue. Réessayez.')
      toast.error("Une erreur est survenue. Veuillez réessayer.")
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
          enterKeyHint="next"
          className={[
            'w-full border px-3 py-2 rounded-lg text-sm',
            'bg-white dark:bg-zinc-800',
            errors.email
              ? 'border-red-500 focus:ring-red-500'
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
          className={[
            'w-full border px-3 py-2 rounded-lg text-sm',
            'bg-white dark:bg-zinc-800',
            errors.address
              ? 'border-red-500 focus:ring-red-500'
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
      <div className="hidden">
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
        aria-live="polite"
      >
        {loading ? 'Redirection…' : 'Payer maintenant'}
      </button>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        En continuant, vous acceptez nos <a className="underline" href="/cgv">CGV</a> et notre{' '}
        <a className="underline" href="/confidentialite">politique de confidentialité</a>.
      </p>
    </form>
  )
}
