// src/components/cart/CartPageClient.tsx
'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { event } from '@/lib/ga';
import CartList from '@/components/cart/CartList';
import StickyCartSummary from '@/components/StickyCartSummary';

export default function CartPageClient() {
  const { cart } = useCart();
  const prefersReduced = useReducedMotion();
  const srRef = useRef<HTMLParagraphElement | null>(null);

  const isEmpty = useMemo(() => cart.length === 0, [cart]);
  const count = useMemo(
    () => cart.reduce((s, it) => s + (Number(it.quantity) || 0), 0),
    [cart]
  );

  // Annonce SR : variations de quantité
  const prevCountRef = useRef<number>(0);
  useEffect(() => {
    if (!srRef.current) return;
    const prev = prevCountRef.current;

    let text = '';
    if (count === 0) text = 'Panier vide';
    else if (prev === 0) text = `${count} article${count > 1 ? 's' : ''} dans le panier`;
    else if (count > prev) {
      const diff = count - prev;
      text = `${diff} article${diff > 1 ? 's' : ''} ajouté${diff > 1 ? 's' : ''}. ${count} au total.`;
    } else if (count < prev) {
      const diff = prev - count;
      text = `${diff} article${diff > 1 ? 's' : ''} retiré${diff > 1 ? 's' : ''}. ${count} au total.`;
    } else {
      text = `${count} article${count > 1 ? 's' : ''} dans le panier`;
    }

    srRef.current.textContent = text;
    prevCountRef.current = count;
  }, [count]);

  const handleExploreClick = () => {
    try {
      event({
        action: 'explore_products',
        category: 'navigation',
        label: 'Explore products from cart page',
        value: 0,
      });
    } catch {
      /* no-op */
    }
  };

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10"
      role="main"
      aria-labelledby="cart-title"
    >
      {/* Live region pour lecteurs d’écran */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <motion.h1
        id="cart-title"
        className="text-3xl font-extrabold text-gray-900 dark:text-white text-center"
        initial={prefersReduced ? false : { opacity: 0, y: 6 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        Mon panier{count > 0 ? ` (${count})` : ''}
      </motion.h1>

      {isEmpty ? (
        <motion.div
          className="text-center text-gray-600 dark:text-gray-400 text-lg space-y-4"
          role="alert"
          aria-live="polite"
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p>Votre panier est vide.</p>
          <Link
            href="/products"
            onClick={handleExploreClick}
            className="inline-block text-sm text-white bg-black hover:bg-gray-800 transition px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-offset-zinc-900"
          >
            Explorer les produits
          </Link>
        </motion.div>
      ) : (
        <motion.section
          className="grid lg:grid-cols-3 gap-10"
          aria-label="Contenu du panier"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={prefersReduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <div className="lg:col-span-2">
            <CartList items={cart as any} />
          </div>

          {/* Résumé sticky + CTA checkout */}
          <StickyCartSummary />
        </motion.section>
      )}
    </main>
  );
}
