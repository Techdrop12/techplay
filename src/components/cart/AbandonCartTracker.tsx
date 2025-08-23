// src/components/cart/AbandonCartTracker.tsx — canon
'use client'

import { useEffect, useMemo, useRef } from 'react'
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
  /** Email utilisateur (indispensable) */
  email: string
  /** Panier courant (avec quantity) */
  cart: (Product & { quantity: number })[]

  /** Délai d’inactivité avant envoi (ms). Priorité: prop > ENV > défaut */
  delayMs?: number
  /** Minimum d’articles pour déclencher */
  minItems?: number
  /** Montant minimum pour déclencher */
  minTotal?: number
}

/** Délai par défaut:
 *  - si NEXT_PUBLIC_ABANDON_DELAY_MS défini → on l’utilise
 *  - sinon: 90s en dev, 30min en prod
 */
const ENV_DELAY = Number.parseInt(process.env.NEXT_PUBLIC_ABANDON_DELAY_MS ?? '', 10)
const DEFAULT_DELAY =
  Number.isFinite(ENV_DELAY)
    ? ENV_DELAY
    : (process.env.NODE_ENV === 'development' ? 90_000 : 30 * 60_000)

export default function AbandonCartTracker({
  email,
  cart,
  delayMs,
  minItems = 1,
  minTotal = 0,
}: AbandonCartTrackerProps) {
  const delay = delayMs ?? DEFAULT_DELAY
  const lastSentSigRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null)

  // Normalisation + signature stable du panier (évite renvois multiples pour le même contenu)
  const { normalized, total, signature } = useMemo(() => {
    const norm: AbCartItem[] = Array.isArray(cart)
      ? cart.map((p) => {
          const id =
            String(
              (p as any)._id ??
              (p as any).id ??
              (p as any).sku ??
              p.slug ??
              Math.random().toString(36).slice(2)
            )
          const title = p.title ?? 'Produit'
          const price = Math.max(0, Number(p.price ?? 0)) || 0
          const quantity = Math.max(1, Number((p as any).quantity ?? 1)) || 1
          const image = (p as any).image ?? '/placeholder.png'
          return { id, title, price, quantity, image }
        })
      : []

    const sum = norm.reduce((acc, it) => acc + it.price * it.quantity, 0)

    // signature: id:qty:price trié → JSON (stable)
    const sig = JSON.stringify(
      norm
        .map((x) => `${x.id}:${x.quantity}:${x.price}`)
        .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    )

    return { normalized: norm, total: sum, signature: sig }
  }, [cart])

  useEffect(() => {
    // Conditions préalables
    const canRun =
      !!email &&
      Array.isArray(normalized) &&
      normalized.length >= minItems &&
      total >= minTotal

    // Nettoyage timer en cours
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (!canRun) return

    // Si même signature déjà envoyée dans cette session → ne rien faire
    if (lastSentSigRef.current === signature) return

    // Programme l’envoi après 'delay'
    timerRef.current = window.setTimeout(async () => {
      try {
        // En plus de la dédup 24h côté lib, on déduplique en mémoire par signature
        await sendAbandonCartReminder(email, normalized as any)
        lastSentSigRef.current = signature
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[AbandonCartTracker] Failed to send reminder:', error)
      }
    }, Math.max(10_000, delay)) // garde un minimum de 10s par sécurité

    // Cleanup au changement d’email/cart/conditions
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [email, normalized, signature, total, minItems, minTotal, delay])

  return null
}
