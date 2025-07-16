'use client'
import { useState } from 'react'

export default function CheckoutForm() {
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: envoyer commande + redirect Stripe
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Adresse de livraison</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="bg-brand text-white px-4 py-2 rounded">
        Payer
      </button>
    </form>
  )
}
