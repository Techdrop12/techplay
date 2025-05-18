// 📁 /src/app/panier/page.js
'use client'
import { useCart } from '@/context/cartContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart })
      })

      const data = await res.json()
      if (data?.url) {
        router.push(data.url)
      }
    } catch (err) {
      toast.error("Erreur lors du paiement")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mon Panier</h1>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item._id} className="border p-2 rounded">
              <div className="font-medium">{item.title}</div>
              <div>{item.price} € x {item.quantity}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleQuantity(item, -1)} className="px-2 py-1 bg-red-500 text-white rounded">-</button>
                <button onClick={() => handleQuantity(item, 1)} className="px-2 py-1 bg-green-500 text-white rounded">+</button>
              </div>
            </div>
          ))}
          <div className="text-right font-bold">Total : {total} €</div>
          <button onClick={handleCheckout} disabled={isLoading} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            {isLoading ? 'Paiement...' : 'Payer'}
          </button>
        </div>
      )}
    </div>
  )
}
