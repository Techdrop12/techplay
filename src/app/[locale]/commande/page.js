'use client'

import { useCart } from '@/context/cartContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)

  const handleSubmit = async () => {
    if (!email) return toast.error('Veuillez entrer un email')

    localStorage.setItem('user_email', email)

    setIsLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cart }),
      })
      const data = await res.json()
      if (data.url) router.push(data.url)
    } catch (error) {
      toast.error('Erreur lors du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Validation de commande</h1>

      <input
        type="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <ul className="mb-4">
        {cart.map((item) => (
          <li key={item._id}>
            {item.title} - {item.price}€ x {item.quantity}
          </li>
        ))}
      </ul>

      <p className="mb-4">Total : <strong>{total} €</strong></p>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Traitement...' : 'Valider et payer'}
      </button>
    </div>
  )
}
