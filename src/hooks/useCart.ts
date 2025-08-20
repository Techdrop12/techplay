// src/hooks/useCart.ts
import { useMemo } from 'react'
import { useCart as useCartCtx } from '@/context/cartContext'
import type { CartContextValue, CartItem } from '@/context/cartContext'

export type { CartItem, CartInput, CartContextValue } from '@/context/cartContext'

// Re-export direct
export const useCart = useCartCtx

// Hook safe si Provider absent (no-ops)
export function useCartSafe(): CartContextValue {
  try {
    const ctx = useCartCtx()
    if (ctx && typeof ctx === 'object') return ctx
  } catch {
    /* certains providers throw quand absents */
  }

  const noop = () => {}
  const empty: CartItem[] = []

  const fallback: CartContextValue = {
    // état
    cart: empty,
    cartId: 'anon',

    // actions
    addToCart: noop,
    removeFromCart: noop,
    updateQuantity: noop,
    increment: noop,
    decrement: noop,
    clearCart: noop,
    replaceCart: noop,
    // alias compat éventuelle
    setCart: noop,

    // coupon
    coupon: null,
    applyCoupon: noop,
    removeCoupon: noop,

    // sélecteurs
    count: 0,
    total: 0,
    isInCart: () => false,
    getItemQuantity: () => 0,
    getItem: () => undefined,
    getLineTotal: () => 0,

    // livraison gratuite (UX)
    freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 60),
    amountToFreeShipping: 0,
    progressToFreeShipping: 0,

    // breakdown complet
    discount: 0,
    shipping: 0,
    tax: 0,
    grandTotal: 0,
  }

  return fallback
}

// Sélecteurs pratiques (itemsCount, subtotal, etc.)
export function useCartSelectors() {
  const { cart } = useCartSafe()

  const { itemsCount, subtotal, ids, isEmpty } = useMemo(() => {
    const items = Array.isArray(cart) ? cart : []
    const itemsCount = items.reduce((s, it) => s + Math.max(1, Number(it?.quantity || 1)), 0)
    const subtotal = items.reduce(
      (s, it) => s + (Number(it?.price) || 0) * Math.max(1, Number(it?.quantity || 1)),
      0
    )
    const ids = items
      .map((it) => String((it as any)?._id ?? it?.slug ?? ''))
      .filter(Boolean)
    const isEmpty = items.length === 0
    return { itemsCount, subtotal, ids, isEmpty }
  }, [cart])

  return { itemsCount, subtotal, ids, isEmpty }
}
