'use client'

import { useCart } from '@/context/cartContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import SEOHead from '@/components/SEOHead'
import { motion } from 'framer-motion'

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)

  const validateEmail = (value) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      return toast.error('Adresse email invalide')
    }

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
      else throw new Error()
    } catch (error) {
      toast.error('Erreur lors du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEOHead overrideTitle="Validation de commande" overrideDescription="Finalisez votre achat sur TechPlay" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-xl mx-auto p-4"
      >
        <h1 className="text-2xl font-bold mb-4">Validation de commande</h1>

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full mb-4 text-sm"
        />

        <ul className="mb-4 text-sm space-y-1">
          {cart.map((item) => (
            <li key={item._id}>
              {item.title} — {item.price}€ × {item.quantity}
            </li>
          ))}
        </ul>

        <p className="mb-4 font-medium">
          Total : <strong>{total} €</strong>
        </p>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          {isLoading ? 'Traitement en cours...' : 'Valider et payer'}
        </button>
      </motion.div>
    </>
  )
}
