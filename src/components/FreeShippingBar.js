'use client'
import { useEffect, useState } from 'react'

export default function FreeShippingBar({ threshold = 50 }) {
  const [amount, setAmount] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      setAmount(total)
      setShow(total < threshold)
    } catch {
      setShow(false)
    }
  }, [])

  if (!show) return null

  const remaining = (threshold - amount).toFixed(2)
  return (
    <div className="bg-yellow-300 text-black text-sm text-center py-2 font-medium animate-pulse">
      Plus que {remaining} € pour la livraison offerte 🚚
    </div>
  )
}