// src/hooks/useWishlist.ts
'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'

export type WishlistItemBase = { id: string } & Record<string, unknown>

const STORAGE_KEY = 'wishlist'
const MAX_ITEMS = Number.parseInt(process.env.NEXT_PUBLIC_WISHLIST_LIMIT ?? '50', 10)

function safeParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback
  } catch {
    return fallback
  }
}

function normalizeId(idLike: unknown): string {
  return String(idLike ?? '').trim()
}

function toCanonical<T extends Record<string, any>>(item: T | null | undefined): (T & { id: string }) | null {
  if (!item || typeof item !== 'object') return null
  const id = normalizeId((item as any).id ?? (item as any)._id)
  if (!id) return null
  return { ...item, id }
}

export interface UseWishlistReturn<T extends WishlistItemBase = WishlistItemBase> {
  items: T[]
  wishlist: T[] // alias rétro-compat
  count: number
  has: (id: string) => boolean
  add: (item: T) => void
  remove: (id: string) => void
  toggle: (item: T) => void
  clear: () => void
}

export function useWishlist<T extends WishlistItemBase = WishlistItemBase>(): UseWishlistReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const mounted = useRef(false)

  // Load + sync inter-onglets
  useEffect(() => {
    mounted.current = true
    const stored = safeParse<T[]>(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null, [])
    setItems(Array.isArray(stored) ? stored : [])

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(safeParse<T[]>(e.newValue, []))
      }
    }
    window.addEventListener('storage', onStorage)

    const onCustom = (e: Event) => {
      try {
        const detail = (e as CustomEvent<T[]>).detail
        if (Array.isArray(detail)) setItems(detail)
      } catch {}
    }
    window.addEventListener('wishlist-updated', onCustom as EventListener)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('wishlist-updated', onCustom as EventListener)
      mounted.current = false
    }
  }, [])

  // Persist + event custom (pour compat éventuelle)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: items }))
      } catch {}
    }
  }, [items])

  const has = useCallback(
    (id: string) => {
      const cid = normalizeId(id)
      return cid ? items.some((x) => normalizeId((x as any).id ?? (x as any)._id) === cid) : false
    },
    [items]
  )

  const add = useCallback((raw: T) => {
    const c = toCanonical(raw)
    if (!c) return
    setItems((prev) => {
      if (prev.some((x) => normalizeId((x as any).id ?? (x as any)._id) === c.id)) return prev
      const next = [c as T, ...prev]
      return next.length > MAX_ITEMS ? next.slice(0, MAX_ITEMS) : next
    })
  }, [])

  const remove = useCallback((id: string) => {
    const cid = normalizeId(id)
    if (!cid) return
    setItems((prev) => prev.filter((x) => normalizeId((x as any).id ?? (x as any)._id) !== cid))
  }, [])

  const toggle = useCallback((raw: T) => {
    const c = toCanonical(raw)
    if (!c) return
    setItems((prev) => {
      const exists = prev.some((x) => normalizeId((x as any).id ?? (x as any)._id) === c.id)
      if (exists) return prev.filter((x) => normalizeId((x as any).id ?? (x as any)._id) !== c.id)
      const next = [c as T, ...prev]
      return next.length > MAX_ITEMS ? next.slice(0, MAX_ITEMS) : next
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.length

  return useMemo<UseWishlistReturn<T>>(
    () => ({ items, wishlist: items, add, remove, toggle, has, clear, count }),
    [items, add, remove, toggle, has, clear, count]
  )
}
