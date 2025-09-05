// src/components/checkout/PurchaseTracker.tsx — purchase (GA4 + DL + Pixel) avec dédup
'use client'

import { useEffect, useRef } from 'react'
import { trackPurchase } from '@/lib/ga'
import { pixelPurchase } from '@/lib/meta-pixel'

type Props = { sessionId?: string; mock?: boolean }

export default function PurchaseTracker({ sessionId, mock }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    if (!sessionId && !mock) return

    const key = sessionId ? `ga:purchase:${sessionId}` : `ga:purchase:mock`
    try { if (sessionStorage.getItem(key) === '1') return } catch {}
    firedRef.current = true

    ;(async () => {
      try {
        let order: any

        if (mock) {
          order = {
            transaction_id: `MOCK-${Date.now()}`,
            currency: 'EUR',
            value: 99.9,
            tax: 0,
            shipping: 0,
            items: [{ item_id: 'mock-1', item_name: 'Produit démo', price: 99.9, quantity: 1 }],
          }
        } else {
          const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId!)}`, { cache: 'no-store' })
          if (!res.ok) throw new Error('order fetch failed')
          order = await res.json()
        }

        // GA4
        try {
          trackPurchase({
            transaction_id: String(order.transaction_id),
            currency: order.currency || 'EUR',
            value: Number(order.value) || 0,
            tax: Number(order.tax) || undefined,
            shipping: Number(order.shipping) || undefined,
            items: Array.isArray(order.items)
              ? order.items.map((it: any) => ({
                  item_id: String(it.item_id ?? it.id ?? it.sku ?? ''),
                  item_name: String(it.item_name ?? it.title ?? it.name ?? 'Article'),
                  price: Number(it.price) || undefined,
                  quantity: Math.max(1, Number(it.quantity || 1)),
                  item_brand: it.item_brand ?? it.brand ?? undefined,
                  item_category: it.item_category ?? it.category ?? undefined,
                  item_variant: it.item_variant ?? it.variant ?? undefined,
                  discount: it.discount ? Number(it.discount) : undefined,
                }))
              : [],
          })
        } catch {}

        // dataLayer
        try {
          ;(window as any).dataLayer = (window as any).dataLayer || []
          ;(window as any).dataLayer.push({
            event: 'purchase',
            ecommerce: {
              transaction_id: String(order.transaction_id),
              currency: order.currency || 'EUR',
              value: Number(order.value) || 0,
              tax: Number(order.tax) || undefined,
              shipping: Number(order.shipping) || undefined,
              items: order.items || [],
            },
          })
        } catch {}

        // Meta Pixel
        try {
          const contents = (order.items || []).map((i: any) => ({
            id: i.item_id ?? i.id,
            quantity: i.quantity,
            item_price: i.price,
          }))
          pixelPurchase?.({
            value: Number(order.value) || 0,
            currency: order.currency || 'EUR',
            contents,
          })
        } catch {}

        try { sessionStorage.setItem(key, '1') } catch {}
      } catch (err) {
        console.error('[PurchaseTracker]', err)
      }
    })()
  }, [sessionId, mock])

  return null
}
