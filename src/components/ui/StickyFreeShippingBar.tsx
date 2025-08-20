// src/components/StickyFreeShippingBar.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { event as gaEvent } from '@/lib/ga';
import { useReducedMotion, motion } from 'framer-motion';

type Props = {
  /** Seuil d’activation de la livraison offerte (en €). Si omis, on tente le contexte, puis l’ENV, sinon 50. */
  threshold?: number;
  /** Délai d’apparition si pas de scroll (ms) */
  autoShowDelayMs?: number;
  /** Position d’apparition après scroll (px) */
  minScrollY?: number;
  /** Clé de persistance pour le dismiss */
  dismissKey?: string;
  /** Routes où la barre est cachée (prefix match) */
  hideOnRoutes?: string[];
  /** Forcer l’affichage même si subtotal = 0 (défaut false) */
  showIfEmpty?: boolean;
  /** Surcharger la locale pour le format monétaire et les libellés (ex: 'fr-FR') */
  locale?: string;
  /** Lien vers le panier (fallback auto selon locale) */
  cartHref?: string;
  /** Lien vers checkout (par défaut /commande) */
  checkoutHref?: string;
  className?: string;
};

export default function StickyFreeShippingBar({
  threshold,
  autoShowDelayMs = 4000,
  minScrollY = 120,
  dismissKey = 'freeShippingBarDismissed',
  hideOnRoutes = ['/commande', '/checkout', '/success', '/_not-found', '/404'],
  showIfEmpty = false,
  locale = 'fr-FR',
  cartHref,
  checkoutHref = '/commande',
  className,
}: Props) {
  const pathname = usePathname() || '';
  const prefersReduced = useReducedMotion();

  // Cart (on récupère aussi le seuil du contexte si dispo)
  const cartCtx = useCart() as any;
  const { cart = [], freeShippingThreshold: ctxThreshold } = cartCtx || {};

  // --- Résolution du seuil ---
  const resolvedThreshold = useMemo(() => {
    if (typeof threshold === 'number' && threshold > 0) return threshold;
    if (typeof ctxThreshold === 'number' && ctxThreshold > 0) return ctxThreshold;
    const env = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD);
    if (Number.isFinite(env) && env > 0) return env;
    return 50;
  }, [threshold, ctxThreshold]);

  // --- Subtotal safe ---
  const subtotal: number = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum: number, it: any) => {
      const price = Number(it?.price ?? 0);
      const qty = Math.max(1, Number(it?.quantity ?? 1));
      return sum + price * qty;
    }, 0);
  }, [cart]);

  const remaining = Math.max(resolvedThreshold - subtotal, 0);
  const reached = remaining === 0;
  const progressPct = Math.min(100, Math.round((subtotal / resolvedThreshold) * 100));

  // --- Format monétaire ---
  const formatEUR = (n: number) =>
    new Intl.NumberFormat(locale || 'fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  // --- Persistance dismiss + visibilité contrôlée ---
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(dismissKey) === '1') setDismissed(true);
    } catch {}
  }, [dismissKey]);

  const onClose = () => {
    try {
      localStorage.setItem(dismissKey, '1');
    } catch {}
    setVisible(false);
    setDismissed(true);
    // tracking
    try {
      gaEvent?.({ action: 'free_ship_bar_dismiss', category: 'engagement', label: 'sticky_freeship' });
    } catch {}
  };

  // --- Masquage par routes ---
  const hiddenByRoute = useMemo(
    () => hideOnRoutes.some((r) => pathname.startsWith(r)),
    [pathname, hideOnRoutes]
  );

  // --- Scroll + auto-show (RAF) ---
  const ticking = useRef(false);
  useEffect(() => {
    if (hiddenByRoute || dismissed) return;
    // Évite d'afficher si panier vide (sauf si demandé)
    if (!showIfEmpty && subtotal <= 0) return;

    const check = () => {
      const y = window.scrollY;
      setVisible((v) => v || y > minScrollY);
      ticking.current = false;
    };
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(check);
        ticking.current = true;
      }
    };

    const timer = window.setTimeout(() => setVisible(true), autoShowDelayMs);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [autoShowDelayMs, minScrollY, hiddenByRoute, dismissed, showIfEmpty, subtotal]);

  // --- Tracking à l’apparition ---
  const firedRef = useRef(false);
  useEffect(() => {
    if (visible && !firedRef.current) {
      firedRef.current = true;
      try {
        gaEvent?.({
          action: 'free_ship_bar_visible',
          category: 'engagement',
          label: 'sticky_freeship',
          value: subtotal,
        });
      } catch {}
    }
  }, [visible, subtotal]);

  // --- Lien panier par défaut selon locale ---
  const defaultCartHref = useMemo(() => {
    const isFr = String(locale).toLowerCase().startsWith('fr');
    return isFr ? '/panier' : '/cart';
  }, [locale]);
  const toCart = cartHref || defaultCartHref;

  // --- Early exit ---
  if (dismissed || hiddenByRoute || !visible) return null;
  if (!Number.isFinite(resolvedThreshold) || resolvedThreshold <= 0) return null;

  const srText = reached
    ? 'Seuil de livraison gratuite atteint.'
    : `Il manque ${formatEUR(remaining)} pour la livraison gratuite.`;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 bottom-0 z-50',
        // padding safe area iOS
        'px-3 sm:px-4 pb-[calc(env(safe-area-inset-bottom,0)+8px)] pt-2',
        className
      )}
      role="region"
      aria-label="Barre livraison offerte"
    >
      {/* Live region SR */}
      <p className="sr-only" role="status" aria-live="polite">
        {srText}
      </p>

      <div
        className={cn(
          'mx-auto max-w-5xl rounded-xl shadow-lg border',
          'bg-white/92 dark:bg-zinc-900/92 border-gray-200 dark:border-zinc-800',
          'supports-[backdrop-filter]:backdrop-blur-lg'
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2">
          <p
            className={cn(
              'text-sm sm:text-base font-semibold',
              reached ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-100'
            )}
          >
            {reached ? (
              <>🎉 Livraison gratuite activée !</>
            ) : (
              <>
                📦 Plus que <span className="text-accent">{formatEUR(remaining)}</span> pour la
                livraison gratuite.
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <Link
              href={toCart}
              className={cn(
                'hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold shadow',
                reached
                  ? 'bg-emerald-600 text-white hover:bg-emerald-600/90'
                  : 'bg-accent text-white hover:bg-accent/90',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
              aria-label="Voir le panier"
              onClick={() => {
                try {
                  gaEvent?.({ action: 'free_ship_bar_cart_click', category: 'engagement', label: 'cart' });
                } catch {}
              }}
            >
              Voir le panier
            </Link>

            <Link
              href={checkoutHref}
              className={cn(
                'inline-flex sm:hidden items-center rounded-full px-4 py-1.5 text-sm font-semibold shadow',
                'bg-accent text-white hover:bg-accent/90',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
              aria-label="Aller au paiement"
              onClick={() => {
                try {
                  gaEvent?.({ action: 'free_ship_bar_checkout_click', category: 'engagement', label: 'checkout' });
                } catch {}
              }}
            >
              Payer
            </Link>

            <button
              onClick={onClose}
              aria-label="Fermer la barre livraison gratuite"
              className="rounded-full px-2 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Barre de progression accessible */}
        <div className="px-3 sm:px-4 pb-3">
          <div
            className="h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            aria-label="Progression vers la livraison gratuite"
            aria-live="polite"
          >
            {prefersReduced ? (
              <div
                className={cn('h-full rounded-full', reached ? 'bg-emerald-500' : 'bg-accent')}
                style={{ width: `${progressPct}%` }}
              />
            ) : (
              <motion.div
                className={cn('h-full rounded-full', reached ? 'bg-emerald-500' : 'bg-accent')}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
