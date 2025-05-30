'use client'

import { useCart } from '@/context/cartContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart()
  const [total, setTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const calc = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(calc.toFixed(2))
  }, [cart])

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Votre panier est vide.')
      return
    }
    router.push('/commande')
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🛒 Votre panier</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Aucun produit pour le moment.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border p-2 rounded shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.price.toFixed(2)} € x {item.quantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item._id, Math.max(1, parseInt(e.target.value)))
                  }
                  className="w-16 text-center border rounded"
                />
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center font-semibold text-lg mt-6">
            <span>Total :</span>
            <span>{total} €</span>
          </div>

          <button
            onClick={handleCheckout}
            className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
          >
            Valider et payer
          </button>
        </motion.div>
      )}
    </div>
  )
}
