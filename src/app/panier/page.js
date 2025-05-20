'use client'

import { useCart } from '../context/cartContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function PanierPage() {
  const { cart, addToCart, removeFromCart } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const total = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2)

  const handleQuantity = (item, delta) => {
    if (delta > 0) {
      addToCart(item)
      toast.success(`+1 ${item.title}`)
    } else {
      removeFromCart(item)
      toast(`−1 ${item.title}`)
    }
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      })

      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Envoie automatique de l'événement panier_abandonne à Brevo
  useEffect(() => {
    if (cart.length > 0) {
      const email = localStorage.getItem('user_email')
      if (email) {
        fetch('/api/brevo-track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            event: 'panier_abandonne',
            cart,
          }),
        }).catch((err) => console.error('Erreur panier_abandonne:', err))
      }
    }
  }, [cart])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Votre panier</h1>
      {cart.length === 0 ? (
        <p>Panier vide</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p>{item.price} € x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleQuantity(item, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantity(item, 1)}>+</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p>Total : <strong>{total} €</strong></p>
            <button
              className="mt-2 px-4 py-2 bg-black text-white rounded"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? 'Redirection...' : 'Passer au paiement'}
            </button>
          </div>
        </>
      )}
      <Link href="/" className="mt-4 inline-block text-blue-600">← Continuer mes achats</Link>
    </div>
  )
}
