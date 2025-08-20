// src/components/cart/CartItem.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
// import { logEvent } from '@/lib/ga' // Décommente si tracking activé

interface CartItemProps {
  item: {
    _id: string;
    slug: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
  };
}

const MIN_QTY = 1;
const MAX_QTY = 99;
const clamp = (n: number) => Math.max(MIN_QTY, Math.min(MAX_QTY, Math.trunc(n || 0)));

export default function CartItem({ item }: CartItemProps) {
  const prefersReduced = useReducedMotion();
  const { removeFromCart, increment, decrement, updateQuantity } = useCart();

  // on garde un état local pour l’input, mais la source de vérité reste le contexte
  const [qty, setQty] = useState<number>(item.quantity);
  const srRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => setQty(item.quantity), [item.quantity]);

  const lineTotal = useMemo(() => item.price * item.quantity, [item.price, item.quantity]);

  const handleRemove = () => {
    removeFromCart(item._id);
    // logEvent('remove_from_cart', { item_id: item._id, quantity: item.quantity, price: item.price, title: item.title })
    srRef.current && (srRef.current.textContent = `${item.title} retiré du panier`);
  };

  const commitQty = (n: number) => {
    const q = clamp(n);
    if (q !== item.quantity) {
      updateQuantity(item._id, q);
      srRef.current && (srRef.current.textContent = `Quantité de ${item.title} mise à ${q}`);
    }
    setQty(q);
  };

  const dec = () => decrement(item._id, 1);
  const inc = () => increment(item._id, 1);

  return (
    <motion.li
      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReduced ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="group flex items-center gap-4 p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-900 dark:border-zinc-700 hover:shadow-md transition-all"
      role="listitem"
      aria-label={`Produit dans le panier : ${item.title}`}
      data-id={item._id}
    >
      {/* live region pour annonces (SR only) */}
      <span ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <Link
        href={`/produit/${item.slug}`}
        className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        aria-label={`Voir la fiche produit de ${item.title}`}
      >
        <Image
          src={item.image || '/placeholder.png'}
          alt={item.title || 'Image produit'}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          priority
        />
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        <Link
          href={`/produit/${item.slug}`}
          className="block font-semibold text-sm text-gray-900 dark:text-white hover:underline line-clamp-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          {item.title}
        </Link>

        {/* prix unitaire */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatPrice(item.price)} / unité
        </p>

        {/* Stepper quantité */}
        <div className="mt-1 inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-zinc-700 px-2 py-1">
          <button
            type="button"
            onClick={dec}
            disabled={item.quantity <= MIN_QTY}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            aria-label={`Diminuer la quantité de ${item.title}`}
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>

          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={qty}
            onChange={(e) => setQty(clamp(Number(e.target.value)))}
            onBlur={() => commitQty(qty)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            aria-label={`Quantité pour ${item.title}`}
            className="w-10 text-center bg-transparent outline-none text-sm"
          />

          <button
            type="button"
            onClick={inc}
            disabled={item.quantity >= MAX_QTY}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            aria-label={`Augmenter la quantité de ${item.title}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* total de ligne + remove */}
      <div className="flex flex-col items-end gap-2">
        <p
          className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums"
          aria-label={`Total pour ${item.title} : ${formatPrice(lineTotal)}`}
        >
          {formatPrice(lineTotal)}
        </p>

        <button
          onClick={handleRemove}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          aria-label={`Supprimer ${item.title} du panier`}
          title={`Supprimer ${item.title}`}
        >
          <Trash2
            className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />
        </button>
      </div>
    </motion.li>
  );
}
