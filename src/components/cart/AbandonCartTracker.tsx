'use client'

import { useEffect } from 'react'
import { sendAbandonCartReminder } from '@/lib/abandon-cart'
import type { Product } from '@/types/product'

interface AbandonCartTrackerProps {
  email: string
  cart: (Product & { quantity: number })[]
}

export default function AbandonCartTracker({ email, cart }: AbandonCartTrackerProps) {
  useEffect(() => {
    // Si pas d'email ou panier vide → ne rien faire
    if (!email || cart.length === 0) return

    // ⏱️ Déclenche après 1m30 d’inactivité
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          sendAbandonCartReminder(email, cart)
        } catch (error) {
          console.error('[AbandonCartTracker] Failed to send reminder:', error)
        }
      }
    }, 90_000) // 90_000 ms = 1m30

    return () => clearTimeout(timer)
  }, [email, cart])

  return null
}
