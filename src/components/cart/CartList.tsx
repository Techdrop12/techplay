// src/components/cart/CartList.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Product } from '@/types/product';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/hooks/useCart';

interface CartListProps {
  items: (Product & { quantity: number })[];
  /** Afficher un mini header (compteur + bouton “Vider”) */
  showControls?: boolean;
  /** Callback clear custom (sinon utilise useCart().clearCart) */
  onClear?: () => void | Promise<void>;
  className?: string;
}

export default function CartList({
  items,
  showControls = true,
  onClear,
  className = '',
}: CartListProps) {
  const prefersReducedMotion = useReducedMotion();
  const srRef = useRef<HTMLSpanElement | null>(null);
  const prevCountRef = useRef<number>(0);
  const { clearCart } = useCart();

  const safeItems = useMemo(
    () =>
      (items || []).map((it) => ({
        _id: (it as any)._id ?? it.slug, // fallback si _id absent
        slug: it.slug,
        title: it.title ?? 'Produit',
        image: it.image ?? '/placeholder.png',
        price: Number(it.price ?? 0),
        quantity: Math.max(1, Number(it.quantity || 1)),
      })),
    [items]
  );

  const isEmpty = safeItems.length === 0;

  const itemsCount = useMemo(
    () => safeItems.reduce((s, it) => s + it.quantity, 0),
    [safeItems]
  );

  // Région live : annonce le nombre d’articles (et l’évolution)
  useEffect(() => {
    if (!srRef.current) return;

    const prev = prevCountRef.current;
    let text: string;

    if (isEmpty) text = 'Panier vide';
    else if (prev === 0) text = `${itemsCount} article${itemsCount > 1 ? 's' : ''} dans le panier`;
    else if (itemsCount > prev) {
      const diff = itemsCount - prev;
      text = `${diff} article${diff > 1 ? 's' : ''} ajouté${diff > 1 ? 's' : ''}. ${itemsCount} au total.`;
    } else if (itemsCount < prev) {
      const diff = prev - itemsCount;
      text = `${diff} article${diff > 1 ? 's' : ''} retiré${diff > 1 ? 's' : ''}. ${itemsCount} au total.`;
    } else {
      text = `${itemsCount} article${itemsCount > 1 ? 's' : ''} dans le panier`;
    }

    srRef.current.textContent = text;
    prevCountRef.current = itemsCount;
  }, [isEmpty, itemsCount]);

  if (isEmpty) {
    return (
      <motion.p
        className="text-center text-gray-600 dark:text-gray-400 text-sm"
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        Aucun article dans le panier.
      </motion.p>
    );
  }

  const handleClear = async () => {
    if (onClear) {
      await Promise.resolve(onClear());
    } else {
      try {
        clearCart();
      } catch {
        /* no-op */
      }
    }
  };

  return (
    <section aria-label="Articles du panier" className={className}>
      {/* Live region (sr-only) */}
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      {showControls && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {itemsCount} article{itemsCount > 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={handleClear}
            disabled={itemsCount === 0}
            aria-disabled={itemsCount === 0}
            className="text-sm font-semibold text-red-600 disabled:text-red-400 disabled:cursor-not-allowed hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
            aria-label="Vider le panier"
          >
            Vider le panier
          </button>
        </div>
      )}

      <ul role="list" className="space-y-4">
        <AnimatePresence initial={false}>
          {safeItems.map((item) => (
            <motion.li
              key={String(item._id)}
              role="listitem"
              layout={!prefersReducedMotion}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            >
              <CartItem
                item={{
                  _id: String(item._id),
                  slug: item.slug,
                  title: item.title,
                  image: item.image,
                  price: item.price,
                  quantity: item.quantity,
                }}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
