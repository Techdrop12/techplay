'use client'

import { useEffect } from 'react'
import type { Product } from '@/types/product'
import { sendAbandonCartReminder } from '@/lib/abandon-cart'

/** Type local – structure attendue par l’API d’abandon de panier */
type AbCartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image?: string
}

interface AbandonCartTrackerProps {
  email: string
  cart: (Product & { quantity: number })[]
}

export default function AbandonCartTracker({ email, cart }: AbandonCartTrackerProps) {
  useEffect(() => {
    if (!email || !Array.isArray(cart) || cart.length === 0) return

    const timer = setTimeout(async () => {
      try {
        const normalized: AbCartItem[] = cart.map((p) => ({
          id:
            String((p as any)._id ??
              (p as any).id ??
              (p as any).sku ??
              p.slug ??
              Math.random().toString(36).slice(2)),
          title: p.title ?? 'Produit',
          price: Number(p.price ?? 0),
          quantity: Math.max(1, Number((p as any).quantity ?? 1)),
          image: (p as any).image ?? '/placeholder.png',
        }))

        // TS est structurel → tant que la forme correspond, c’est OK
        await sendAbandonCartReminder(email, normalized as any)
      } catch (error) {
        console.error('[AbandonCartTracker] Failed to send reminder:', error)
      }
    }, 90_000) // 1m30

    return () => clearTimeout(timer)
  }, [email, cart])

  return null
}
