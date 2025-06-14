'use client'

import { useEffect } from 'react'
import { useCart } from '@/context/cartContext'

export default function CartAbandonTrigger() {
  const { cart } = useCart()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!cart || cart.length === 0) return

    const emailSentKey = 'abandon_email_sent'
    const email = localStorage.getItem('cartEmail')

    // Si pas d'email associé, ou déjà envoyé → on ne fait rien
    if (!email || localStorage.getItem(emailSentKey) === 'true') return

    // Déclenche l'envoi après 24 heures si l'utilisateur n’a pas finalisé la commande
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/emails/cart-abandonne', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, email }),
        })

        const data = await res.json()
        if (data.success) {
          localStorage.setItem(emailSentKey, 'true')
        }
      } catch (e) {
        console.warn('Erreur envoi email abandon panier :', e)
      }
    }, 24 * 60 * 60 * 1000) // 24 heures en millisecondes

    return () => clearTimeout(timeoutId)
  }, [cart])

  return null
}
