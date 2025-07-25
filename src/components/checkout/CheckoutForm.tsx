'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCheckoutSession } from '@/lib/checkout'
import { event } from '@/lib/ga'

export default function CheckoutForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      event({
        action: 'checkout_start',
        category: 'engagement',
        label: 'checkout_form',
        value: 1, // Obligatoire pour respecter le typage
      })

      const session = await createCheckoutSession({ email, address })

      if (session?.url) {
        window.location.href = session.url
      } else {
        throw new Error('Erreur lors de la redirection vers Stripe.')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border px-3 py-2 rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Adresse de livraison
        </label>
        <input
          id="address"
          type="text"
          className="w-full border px-3 py-2 rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          autoComplete="street-address"
          aria-required="true"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-60"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Chargement...' : 'Payer maintenant'}
      </button>
    </form>
  )
}
