// src/hooks/useWishlist.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UI } from '@/lib/constants';

export type WishlistItemBase = { id: string } & Record<string, unknown>;

const STORAGE_KEY = 'wishlist';
const MAX_ITEMS = UI.WISHLIST_LIMIT;

function safeParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeId(idLike: unknown): string {
  return String(idLike ?? '').trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getItemId(item: unknown): string {
  if (!isRecord(item)) return '';
  return normalizeId(item.id ?? item._id);
}

function toCanonical<T extends Record<string, unknown>>(
  item: T | null | undefined
): (T & { id: string }) | null {
  if (!isRecord(item)) return null;

  const id = getItemId(item);
  if (!id) return null;

  return { ...item, id } as T & { id: string };
}

/** Nettoie un tableau brut issu du storage vers une liste canonique */
function sanitizeArray<T extends Record<string, unknown>>(arr: unknown): T[] {
  if (!Array.isArray(arr)) return [];

  const canon = arr.map((x) => toCanonical(x as T)).filter(Boolean) as (T & { id: string })[];

  const seen = new Set<string>();
  const out: T[] = [];

  for (const it of canon) {
    const id = getItemId(it);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(it as T);
  }

  return out.slice(0, MAX_ITEMS);
}

/** Même ensemble d’ids (ordre ignoré) — évite des setState inutiles depuis les events. */
function sameWishlistByIds<T extends Record<string, unknown>>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const idsA = a.map(getItemId).filter(Boolean).sort();
  const idsB = b.map(getItemId).filter(Boolean).sort();
  return idsA.join('\0') === idsB.join('\0');
}

function persistAndBroadcast<T extends Record<string, unknown>>(list: T[]) {
  if (typeof window === 'undefined') return;
  const clean = sanitizeArray<T>(list);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: clean }));
  } catch {
    // no-op
  }
}

export interface UseWishlistReturn<T extends WishlistItemBase = WishlistItemBase> {
  items: T[];
  wishlist: T[];
  count: number;
  has: (id: string) => boolean;
  add: (item: T) => void;
  remove: (id: string) => void;
  toggle: (item: T) => void;
  clear: () => void;
}

export function useWishlist<T extends WishlistItemBase = WishlistItemBase>(): UseWishlistReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    setItems(sanitizeArray<T>(safeParse(stored, [])));

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = sanitizeArray<T>(safeParse(e.newValue, []));
      setItems((prev) => (sameWishlistByIds(prev, next) ? prev : next));
    };

    const onCustom = (e: Event) => {
      try {
        const detail = (e as CustomEvent<T[]>).detail;
        if (!Array.isArray(detail)) return;
        const next = sanitizeArray<T>(detail);
        setItems((prev) => (sameWishlistByIds(prev, next) ? prev : next));
      } catch {
        // no-op
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('wishlist-updated', onCustom as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wishlist-updated', onCustom as EventListener);
      mounted.current = false;
    };
  }, []);

  const has = useCallback(
    (id: string) => {
      const cid = normalizeId(id);
      if (!cid) return false;
      return items.some((item) => getItemId(item) === cid);
    },
    [items]
  );

  const add = useCallback((raw: T) => {
    const canonical = toCanonical(raw);
    if (!canonical) return;

    setItems((prev) => {
      if (prev.some((item) => getItemId(item) === canonical.id)) return prev;
      const next = [canonical as T, ...prev];
      const finalNext = next.length > MAX_ITEMS ? next.slice(0, MAX_ITEMS) : next;
      queueMicrotask(() => persistAndBroadcast(finalNext));
      return finalNext;
    });
  }, []);

  const remove = useCallback((id: string) => {
    const cid = normalizeId(id);
    if (!cid) return;
    setItems((prev) => {
      const next = prev.filter((item) => getItemId(item) !== cid);
      if (sameWishlistByIds(prev, next)) return prev;
      queueMicrotask(() => persistAndBroadcast(next));
      return next;
    });
  }, []);

  const toggle = useCallback((raw: T) => {
    const canonical = toCanonical(raw);
    if (!canonical) return;

    setItems((prev) => {
      const exists = prev.some((item) => getItemId(item) === canonical.id);
      const next = exists
        ? prev.filter((item) => getItemId(item) !== canonical.id)
        : [canonical as T, ...prev].slice(0, MAX_ITEMS);
      queueMicrotask(() => persistAndBroadcast(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      queueMicrotask(() => persistAndBroadcast([] as T[]));
      return [];
    });
  }, []);

  const count = items.length;

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
  );
}
