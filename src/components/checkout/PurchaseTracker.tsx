'use client'

import { useEffect, useRef } from 'react'

import { trackPurchase } from '@/lib/ga'
import { error as logError } from '@/lib/logger'
import { pixelPurchase } from '@/lib/meta-pixel'

type Props = { sessionId?: string; mock?: boolean }

type PurchaseItem = {
  item_id?: string
  id?: string
  sku?: string
  item_name?: string
  title?: string
  name?: string
  price?: number
  quantity?: number
  item_brand?: string
  brand?: string
  item_category?: string
  category?: string
  item_variant?: string
  variant?: string
  discount?: number
}

type PurchaseOrder = {
  transaction_id?: string
  currency?: string
  value?: number
  tax?: number
  shipping?: number
  items?: PurchaseItem[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toStringSafe(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function normalizeItems(value: unknown): PurchaseItem[] {
  if (!Array.isArray(value)) return []

  return value.map((item) => {
    if (!isRecord(item)) return {}

    return {
      item_id: toStringSafe(item.item_id) || toStringSafe(item.id) || toStringSafe(item.sku),
      id: toStringSafe(item.id),
      sku: toStringSafe(item.sku),
      item_name: toStringSafe(item.item_name) || toStringSafe(item.title) || toStringSafe(item.name) || 'Article',
      title: toStringSafe(item.title),
      name: toStringSafe(item.name),
      price: toNumber(item.price, 0),
      quantity: Math.max(1, toNumber(item.quantity, 1)),
      item_brand: toStringSafe(item.item_brand) || toStringSafe(item.brand),
      brand: toStringSafe(item.brand),
      item_category: toStringSafe(item.item_category) || toStringSafe(item.category),
      category: toStringSafe(item.category),
      item_variant: toStringSafe(item.item_variant) || toStringSafe(item.variant),
      variant: toStringSafe(item.variant),
      discount: Number.isFinite(Number(item.discount)) ? Number(item.discount) : undefined,
    }
  })
}

function normalizeOrder(value: unknown): PurchaseOrder {
  if (!isRecord(value)) return {}

  return {
    transaction_id: toStringSafe(value.transaction_id),
    currency: toStringSafe(value.currency, 'EUR'),
    value: toNumber(value.value, 0),
    tax: Number.isFinite(Number(value.tax)) ? Number(value.tax) : undefined,
    shipping: Number.isFinite(Number(value.shipping)) ? Number(value.shipping) : undefined,
    items: normalizeItems(value.items),
  }
}

export default function PurchaseTracker({ sessionId, mock }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    if (!sessionId && !mock) return

    const key = sessionId ? `ga:purchase:${sessionId}` : 'ga:purchase:mock'

    try {
      if (sessionStorage.getItem(key) === '1') return
    } catch {}

    firedRef.current = true

    ;(async () => {
      try {
        let rawOrder: unknown

        if (mock) {
          rawOrder = {
            transaction_id: `MOCK-${Date.now()}`,
            currency: 'EUR',
            value: 99.9,
            tax: 0,
            shipping: 0,
            items: [{ item_id: 'mock-1', item_name: 'Produit démo', price: 99.9, quantity: 1 }],
          }
        } else {
          const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId!)}`, {
            cache: 'no-store',
          })
          if (!res.ok) throw new Error('order fetch failed')
          rawOrder = await res.json()
        }

        const order = normalizeOrder(rawOrder)

        try {
          trackPurchase({
            transaction_id: String(order.transaction_id || `purchase-${Date.now()}`),
            currency: order.currency || 'EUR',
            value: toNumber(order.value, 0),
            tax: order.tax,
            shipping: order.shipping,
            items: (order.items || []).map((it) => ({
              item_id: String(it.item_id || it.id || it.sku || ''),
              item_name: String(it.item_name || it.title || it.name || 'Article'),
              price: Number.isFinite(Number(it.price)) ? Number(it.price) : undefined,
              quantity: Math.max(1, toNumber(it.quantity, 1)),
              item_brand: it.item_brand || it.brand || undefined,
              item_category: it.item_category || it.category || undefined,
              item_variant: it.item_variant || it.variant || undefined,
              discount: Number.isFinite(Number(it.discount)) ? Number(it.discount) : undefined,
            })),
          })
        } catch {}

        try {
          window.dataLayer = window.dataLayer || []
          window.dataLayer.push({
            event: 'purchase',
            ecommerce: {
              transaction_id: String(order.transaction_id || `purchase-${Date.now()}`),
              currency: order.currency || 'EUR',
              value: toNumber(order.value, 0),
              tax: order.tax,
              shipping: order.shipping,
              items: order.items || [],
            },
          })
        } catch {}

        try {
          const contents = (order.items || []).map((i) => ({
            id: i.item_id || i.id,
            quantity: i.quantity,
            item_price: i.price,
          }))

          pixelPurchase?.({
            value: toNumber(order.value, 0),
            currency: order.currency || 'EUR',
            contents,
          })
        } catch {}

        try {
          sessionStorage.setItem(key, '1')
        } catch {}
      } catch (err) {
        logError('[PurchaseTracker]', err)
      }
    })()
  }, [sessionId, mock])

  return null
}