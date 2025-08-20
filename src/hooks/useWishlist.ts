'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

export type WishlistItemBase = { id: string } & Record<string, unknown>;

const STORAGE_KEY = 'wishlist';

function safeParse<T>(json: string | null, fallback: T): T {
  try {
    return json ? (JSON.parse(json) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useWishlist<T extends WishlistItemBase = WishlistItemBase>() {
  const [items, setItems] = useState<T[]>([]);
  const isMounted = useRef(false);

  // Load from localStorage (client only)
  useEffect(() => {
    isMounted.current = true;
    if (typeof window !== 'undefined') {
      const stored = safeParse<T[]>(localStorage.getItem(STORAGE_KEY), []);
      setItems(stored);
    }
    // sync entre onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(safeParse<T[]>(e.newValue, []));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      isMounted.current = false;
    };
  }, []);

  // Persist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const has = useCallback((id: string) => items.some((x) => x.id === id), [items]);

  const add = useCallback((item: T) => {
    setItems((prev) => (prev.some((x) => x.id === item.id) ? prev : [...prev, item]));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toggle = useCallback((item: T) => {
    setItems((prev) => (prev.some((x) => x.id === item.id) ? prev.filter((x) => x.id !== item.id) : [...prev, item]));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.length;
  const value = useMemo(() => ({ items, add, remove, toggle, has, clear, count }), [
    items,
    add,
    remove,
    toggle,
    has,
    clear,
    count,
  ]);

  return value;
}
