'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/context/cartContext'
import { pageview } from '@/lib/analytics'
import { useRouter } from 'next/navigation'

interface CartItem {
  title: string
  [key: string]: any
}

export default function CartReminder() {
  const { cart } = useCart()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('techplay_last_cart', JSON.stringify(cart))
    }
  }, [cart])

  useEffect(() => {
    if (cart.length > 0) {
      const timer = setTimeout(() => setShow(true), 30000)
      return () => clearTimeout(timer)
    }
  }, [cart])

  useEffect(() => {
    if (cart.length > 0) {
      const lastProduct = cart[cart.length - 1] as CartItem
      setSuggestion(`Vous aimerez peut-être : ${lastProduct.title}`)
    }
  }, [cart])

  useEffect(() => {
    if (show) {
      pageview('/cart-reminder')
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'cart_reminder_displayed')
      }
    }
  }, [show])

  const handleClick = () => {
    setShow(false)
    router.push('/cart')
  }

  if (!show) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded shadow-xl z-50 cursor-pointer transition-opacity hover:opacity-90 animate-fadeIn"
      onClick={handleClick}
    >
      <strong className="block font-semibold mb-1">🛒 Vous avez un panier en attente</strong>
      <span className="text-sm">
        {suggestion ?? 'Cliquez ici pour reprendre votre commande.'}
      </span>
    </div>
  )
}
