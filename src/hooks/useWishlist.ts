// src/hooks/useWishlist.ts
'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

export type WishlistItemBase = { id: string } & Record<string, unknown>

const STORAGE_KEY = 'wishlist'

function safeParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback
  } catch {
    return fallback
  }
}

export interface UseWishlistReturn<T extends WishlistItemBase = WishlistItemBase> {
  /** liste canonique */
  items: T[]
  /** alias rétro-compat pour l’existant (Header/MobileNav) */
  wishlist: T[]
  /** taille */
  count: number
  /** helpers */
  has: (id: string) => boolean
  add: (item: T) => void
  remove: (id: string) => void
  toggle: (item: T) => void
  clear: () => void
}

export function useWishlist<T extends WishlistItemBase = WishlistItemBase>(): UseWishlistReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const mounted = useRef(false)

  // Load from localStorage (client only)
  useEffect(() => {
    mounted.current = true
    const stored = safeParse<T[]>(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null, [])
    setItems(stored)

    // sync inter-onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(safeParse<T[]>(e.newValue, []))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      mounted.current = false
    }
  }, [])

  // Persist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch {
        // no-op
      }
    }
  }, [items])

  const has = useCallback((id: string) => items.some((x) => x.id === id), [items])

  const add = useCallback((item: T) => {
    setItems((prev) => (prev.some((x) => x.id === item.id) ? prev : [item, ...prev]))
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const toggle = useCallback((item: T) => {
    setItems((prev) => (prev.some((x) => x.id === item.id) ? prev.filter((x) => x.id !== item.id) : [item, ...prev]))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.length

  // objet mémoisé — et alias wishlist pour compat
  const value = useMemo<UseWishlistReturn<T>>(
    () => ({ items, wishlist: items, add, remove, toggle, has, clear, count }),
    [items, add, remove, toggle, has, clear, count]
  )

  return value
}
