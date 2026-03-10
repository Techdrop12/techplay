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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getItemId(item: unknown): string {
  if (!isRecord(item)) return ''
  return normalizeId(item.id ?? item._id)
}

function toCanonical<T extends Record<string, unknown>>(
  item: T | null | undefined
): (T & { id: string }) | null {
  if (!isRecord(item)) return null

  const id = getItemId(item)
  if (!id) return null

  return { ...item, id } as T & { id: string }
}

/** Nettoie un tableau brut issu du storage vers une liste canonique */
function sanitizeArray<T extends Record<string, unknown>>(arr: unknown): T[] {
  if (!Array.isArray(arr)) return []

  const canon = arr
    .map((x) => toCanonical(x as T))
    .filter(Boolean) as (T & { id: string })[]

  const seen = new Set<string>()
  const out: T[] = []

  for (const it of canon) {
    const id = getItemId(it)
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(it as T)
  }

  return out.slice(0, MAX_ITEMS)
}

export interface UseWishlistReturn<T extends WishlistItemBase = WishlistItemBase> {
  items: T[]
  wishlist: T[]
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

  useEffect(() => {
    mounted.current = true

    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    setItems(sanitizeArray<T>(safeParse(stored, [])))

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(sanitizeArray<T>(safeParse(e.newValue, [])))
      }
    }

    const onCustom = (e: Event) => {
      try {
        const detail = (e as CustomEvent<T[]>).detail
        if (Array.isArray(detail)) {
          setItems(sanitizeArray<T>(detail))
        }
      } catch {}
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('wishlist-updated', onCustom as EventListener)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('wishlist-updated', onCustom as EventListener)
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: items }))
    } catch {}
  }, [items])

  const has = useCallback(
    (id: string) => {
      const cid = normalizeId(id)
      if (!cid) return false
      return items.some((item) => getItemId(item) === cid)
    },
    [items]
  )

  const add = useCallback((raw: T) => {
    const canonical = toCanonical(raw)
    if (!canonical) return

    setItems((prev) => {
      if (prev.some((item) => getItemId(item) === canonical.id)) return prev
      const next = [canonical as T, ...prev]
      return next.length > MAX_ITEMS ? next.slice(0, MAX_ITEMS) : next
    })
  }, [])

  const remove = useCallback((id: string) => {
    const cid = normalizeId(id)
    if (!cid) return
    setItems((prev) => prev.filter((item) => getItemId(item) !== cid))
  }, [])

  const toggle = useCallback((raw: T) => {
    const canonical = toCanonical(raw)
    if (!canonical) return

    setItems((prev) => {
      const exists = prev.some((item) => getItemId(item) === canonical.id)
      if (exists) {
        return prev.filter((item) => getItemId(item) !== canonical.id)
      }

      const next = [canonical as T, ...prev]
      return next.length > MAX_ITEMS ? next.slice(0, MAX_ITEMS) : next
    })
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.length

  return useMemo(
    () => ({
      items,
      wishlist: items,
      count,
      has,
      add,
      remove,
      toggle,
      clear,
    }),
    [items, count, has, add, remove, toggle, clear]
  )
}