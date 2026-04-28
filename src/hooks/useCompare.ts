'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Product } from '@/types/product';

const STORAGE_KEY = 'techplay_compare';
const MAX_COMPARE = 3;

function readStorage(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded, ignore
  }
}

export function useCompare() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(readStorage());
  }, []);

  const add = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      const id = String((product as Record<string, unknown>)._id ?? product.id ?? product.slug ?? '');
      if (prev.some((p) => String((p as Record<string, unknown>)._id ?? p.id ?? p.slug ?? '') === id)) return prev;
      const next = [...prev, product];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter(
        (p) => String((p as Record<string, unknown>)._id ?? p.id ?? p.slug ?? '') !== productId
      );
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStorage([]);
    setItems([]);
  }, []);

  const isInCompare = useCallback(
    (productId: string) =>
      items.some(
        (p) => String((p as Record<string, unknown>)._id ?? p.id ?? p.slug ?? '') === productId
      ),
    [items]
  );

  const canAdd = items.length < MAX_COMPARE;

  return { items, add, remove, clear, isInCompare, canAdd, count: items.length };
}
