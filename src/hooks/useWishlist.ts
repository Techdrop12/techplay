// src/hooks/useWishlist.ts
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

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

async function dbAdd(productId: string): Promise<void> {
  try {
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
  } catch {
    // dégradé gracieux
  }
}

async function dbRemove(productId: string): Promise<void> {
  try {
    await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' });
  } catch {
    // dégradé gracieux
  }
}

async function dbFetchIds(): Promise<string[]> {
  try {
    const res = await fetch('/api/wishlist', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as { productIds?: string[] };
    return Array.isArray(data.productIds) ? data.productIds : [];
  } catch {
    return [];
  }
}

async function dbSyncBulk(productIds: string[]): Promise<void> {
  try {
    await fetch('/api/wishlist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    });
  } catch {
    // dégradé gracieux
  }
}

async function fetchProductsByIds(ids: string[]): Promise<WishlistItemBase[]> {
  if (!ids.length) return [];
  try {
    const params = ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&');
    const res = await fetch(`/api/products/by-ids?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: WishlistItemBase[] } | WishlistItemBase[];
    const products = Array.isArray(data) ? data : (data as { products?: WishlistItemBase[] }).products ?? [];
    return products.map((p) => ({ ...p, id: getItemId(p) })).filter((p) => p.id);
  } catch {
    return [];
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
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const syncedRef = useRef(false);

  // Charge depuis localStorage au montage
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

  // Sync DB → localStorage quand l'utilisateur se connecte
  useEffect(() => {
    if (!isLoggedIn || syncedRef.current) return;
    syncedRef.current = true;

    void (async () => {
      const dbIds = await dbFetchIds();
      if (!dbIds.length) {
        // Pas d'items en DB → push les items localStorage vers DB
        const localIds = sanitizeArray<T>(safeParse(
          typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
          []
        )).map(getItemId).filter(Boolean);

        if (localIds.length) await dbSyncBulk(localIds);
        return;
      }

      // Items en DB → fusionner avec localStorage
      const localItems = sanitizeArray<T>(safeParse(
        typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
        []
      ));
      const localIds = new Set(localItems.map(getItemId));

      // IDs en DB mais pas en localStorage → fetch product data
      const missingIds = dbIds.filter((id) => !localIds.has(id));
      const fetched = missingIds.length ? await fetchProductsByIds(missingIds) as T[] : [];

      // IDs en localStorage mais pas en DB → push vers DB
      const localOnlyIds = localItems.map(getItemId).filter((id) => !dbIds.includes(id));
      if (localOnlyIds.length) await dbSyncBulk([...dbIds, ...localOnlyIds]);

      if (fetched.length && mounted.current) {
        setItems((prev) => {
          const merged = sanitizeArray<T>([...prev, ...fetched]);
          queueMicrotask(() => persistAndBroadcast(merged));
          return merged;
        });
      }
    })();
  }, [isLoggedIn]);

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
      queueMicrotask(() => {
        persistAndBroadcast(finalNext);
        if (isLoggedIn) void dbAdd(canonical.id);
      });
      return finalNext;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const remove = useCallback((id: string) => {
    const cid = normalizeId(id);
    if (!cid) return;
    setItems((prev) => {
      const next = prev.filter((item) => getItemId(item) !== cid);
      if (sameWishlistByIds(prev, next)) return prev;
      queueMicrotask(() => {
        persistAndBroadcast(next);
        if (isLoggedIn) void dbRemove(cid);
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const toggle = useCallback((raw: T) => {
    const canonical = toCanonical(raw);
    if (!canonical) return;

    setItems((prev) => {
      const exists = prev.some((item) => getItemId(item) === canonical.id);
      const next = exists
        ? prev.filter((item) => getItemId(item) !== canonical.id)
        : [canonical as T, ...prev].slice(0, MAX_ITEMS);
      queueMicrotask(() => {
        persistAndBroadcast(next);
        if (isLoggedIn) {
          if (exists) void dbRemove(canonical.id);
          else void dbAdd(canonical.id);
        }
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const clear = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      queueMicrotask(() => {
        persistAndBroadcast([] as T[]);
        if (isLoggedIn) void dbSyncBulk([]);
      });
      return [];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

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
