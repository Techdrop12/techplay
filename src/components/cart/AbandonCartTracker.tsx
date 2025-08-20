'use client'

import { useEffect, useMemo } from 'react'
import { sendAbandonCartReminder } from '@/lib/abandon-cart'
import type { Product } from '@/types/product'

type CartItemDTO = {
  id: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

interface AbandonCartTrackerProps {
  email: string
  cart: (Product & { quantity: number })[]
}

function adaptCart(items: (Product & { quantity: number })[]): CartItemDTO[] {
  return items.map((p) => ({
    id: String((p as any)._id ?? (p as any).id ?? p.slug ?? p.title ?? 'unknown'),
    title: p.title ?? 'Produit',
    price: Number((p as any).price ?? 0),
    quantity: Number((p as any).quantity ?? 1),
    imageUrl: (p as any).imageUrl ?? (p as any).image ?? undefined,
  }))
}

export default function AbandonCartTracker({ email, cart }: AbandonCartTrackerProps) {
  const payload = useMemo(() => adaptCart(cart), [cart])

  useEffect(() => {
    if (!email || payload.length === 0) return

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          sendAbandonCartReminder(email, payload)
        } catch (error) {
          console.error('[AbandonCartTracker] Failed to send reminder:', error)
        }
      }
    }, 90_000) // 1m30

    return () => clearTimeout(timer)
  }, [email, payload])

  return null
}
