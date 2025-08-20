// src/components/StickyCartSummary.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCart } from '@/context/cartContext';
import { formatPrice, cn } from '@/lib/utils';
import { event, logEvent } from '@/lib/ga';
import { useTranslations } from 'next-intl';

type Props = {
  locale?: string;
  cartHref?: string;        // ex: '/cart' ou '/panier'
  checkoutHref?: string;    // ex: '/commande'
  excludePaths?: string[];
  freeShippingThreshold?: number; // si non fourni, on prend le contexte/env
  className?: string;
};

/**
 * StickyCartSummary — résumé panier mobile
 * - Mobile only (md:hidden), safe-area iOS, blur, spring anim
 * - Masqué sur /checkout, /commande, /cart, /panier, /404, /_not-found (configurable)
 * - État plié/déplié persistant (localStorage)
 * - Utilise les totaux du CartContext (remise, TVA, livraison, total)
 * - a11y + aria-live
 * - Tracking GA4 + logEvent custom
 */
export default function StickyCartSummary({
  locale = 'fr',
  cartHref,
  checkoutHref,
  excludePaths = ['/checkout', '/commande', '/cart', '/panier', '/404', '/_not-found'],
  freeShippingThreshold,
  className,
}: Props) {
  const pathname = usePathname() || '';
  const prefersReduced = useReducedMotion();

  // ⛔️ Ne rien monter sur les routes exclues
  const isExcluded = excludePaths.some((p) => pathname.includes(p));
  if (isExcluded) return null;

  // i18n (fallback safe si provider indisponible)
  let t: any;
  try {
    t = useTranslations('cart');
  } catch {
    t = ((key: string, _v?: Record<string, any>) => {
      // fallback minimal FR
      const dict: Record<string, string> = {
        mobile_summary: 'Résumé de votre panier',
        show: 'Afficher',
        hide: 'Masquer',
        item: 'article',
        total: 'Total',
        free_shipping: 'Livraison offerte',
        free_shipping_progress: 'Progression vers la livraison offerte',
        free_shipping_remaining: 'Plus que {amount} pour la livraison gratuite.',
        free_shipping_unlocked: 'Bravo ! La livraison est offerte 🎉',
        view_cart: 'Voir le panier',
        checkout: 'Commander',
        secure_payment: 'Paiement sécurisé',
        fast_shipping: '48h',
        support: 'Support 7j/7',
        subtotal: 'Sous-total',
        discount: 'Remise',
        vat: 'TVA (est.)',
        shipping: 'Livraison',
      };
      return dict[key] ?? key;
    }) as any;
  }
  const tx = (key: string, fallback: string, values?: Record<string, any>) => {
    try {
      return values ? t(key as any, values as any) : (t(key as any) as any);
    } catch {
      return fallback;
    }
  };

  // ✅ Panier (totaux du contexte)
  const {
    cart,
    count,
    total, // sous-total
    discount,
    tax,
    shipping,
    grandTotal,
    amountToFreeShipping,
    progressToFreeShipping,
    freeShippingThreshold: ctxThreshold,
  } = useCart();

  // Seuil livraison offerte (prop > contexte > env > fallback)
  const FREE_SHIP = useMemo(() => {
    if (typeof freeShippingThreshold === 'number' && freeShippingThreshold > 0) return freeShippingThreshold;
    if (typeof ctxThreshold === 'number' && ctxThreshold > 0) return ctxThreshold;
    const env = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD);
    return Number.isFinite(env) && env > 0 ? env : 50;
  }, [freeShippingThreshold, ctxThreshold]);

  // Compat si certaines valeurs de contexte sont absentes
  const subtotal = Number.isFinite(total) ? total : (cart ?? []).reduce((s, it: any) => s + (it?.price || 0) * (it?.quantity || 1), 0);
  const remaining = Number.isFinite(amountToFreeShipping)
    ? amountToFreeShipping
    : Math.max(0, FREE_SHIP - subtotal);
  const progress = Number.isFinite(progressToFreeShipping)
    ? progressToFreeShipping
    : Math.min(100, Math.round((subtotal / FREE_SHIP) * 100));
  const payable = Number.isFinite(grandTotal) ? grandTotal : subtotal + (Number.isFinite(shipping) ? shipping : 0) + (Number.isFinite(tax) ? tax : 0);

  // Mémorisation UI (plié/déplié)
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('tp_cart_sticky_collapsed');
      if (saved === '1') setCollapsed(true);
    } catch {}
  }, []);
  const setCollapsedPersist = (v: boolean) => {
    setCollapsed(v);
    try {
      localStorage.setItem('tp_cart_sticky_collapsed', v ? '1' : '0');
    } catch {}
  };

  // Affichage uniquement si items
  const visible = mounted && (count ?? 0) > 0;
  const gotoCart = cartHref || (locale === 'fr' ? '/cart' : '/cart');
  const gotoCheckout = checkoutHref || '/commande';

  // Tracking à l’apparition
  const trackedRef = useRef(false);
  useEffect(() => {
    if (visible && !trackedRef.current) {
      trackedRef.current = true;
      try {
        event({
          action: 'sticky_cart_visible',
          category: 'engagement',
          label: 'sticky_cart',
          value: count,
        });
      } catch {}
    }
  }, [visible, count]);

  const onCta = (label: string) => {
    try {
      event({ action: 'sticky_cart_click', category: 'engagement', label, value: subtotal });
      logEvent?.('sticky_cart_click', {
        page: pathname,
        cart_count: count,
        total_price: subtotal,
        label,
      });
    } catch {}
  };

  if (!visible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key="sticky-cart"
        initial={prefersReduced ? { y: 0, opacity: 1 } : { y: 72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={prefersReduced ? { y: 0, opacity: 0 } : { y: 72, opacity: 0 }}
        transition={prefersReduced ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 26 }}
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-[60]',
          'backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-zinc-900/85',
          'border-t border-gray-200 dark:border-zinc-800 shadow-[0_-6px_20px_rgba(0,0,0,0.08)]',
          'pb-[env(safe-area-inset-bottom)]',
          className
        )}
        role="region"
        aria-label={tx('mobile_summary', 'Résumé de votre panier', { count })}
        data-visible="true"
      >
        {/* Barre supérieure : toggle + total à payer */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            type="button"
            onClick={() => setCollapsedPersist(!collapsed)}
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent rounded-md px-1 -mx-1"
            aria-expanded={!collapsed}
            aria-controls="sticky-cart-panel"
          >
            {collapsed ? tx('show', 'Afficher') : tx('hide', 'Masquer')} · {count}{' '}
            {tx('item', (count ?? 0) > 1 ? 'articles' : 'article', { count })}
          </button>

          <div className="text-sm text-gray-800 dark:text-gray-100" aria-live="polite">
            {tx('total', 'Total')} : <strong className="ml-1">{formatPrice(payable)}</strong>
          </div>
        </div>

        {/* Panneau détaillé */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              id="sticky-cart-panel"
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Progress “livraison offerte” */}
              <div className="px-4 pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300 mb-1">
                  <span>{tx('free_shipping', 'Livraison offerte')}</span>
                  <span aria-hidden="true">{progress}%</span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-gray-200/70 dark:bg-zinc-800 overflow-hidden"
                  aria-label={tx('free_shipping_progress', 'Progression vers la livraison offerte')}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <motion.div
                    className={cn('h-full rounded-full', progress >= 100 ? 'bg-green-500' : 'bg-accent')}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>

                <p
                  className={cn(
                    'mt-2 text-xs',
                    remaining > 0
                      ? 'text-gray-600 dark:text-gray-300'
                      : 'text-green-600 dark:text-green-400 font-semibold'
                  )}
                  aria-live="polite"
                >
                  {remaining > 0
                    ? tx('free_shipping_remaining', 'Plus que {amount} pour la livraison gratuite.', {
                        amount: formatPrice(remaining),
                      })
                    : tx('free_shipping_unlocked', 'Bravo ! La livraison est offerte 🎉')}
                </p>
              </div>

              {/* Lignes montants (rapide) */}
              <div className="px-4 pt-2 text-[13px] text-gray-700 dark:text-gray-300 space-y-1">
                <Line label={tx('subtotal', 'Sous-total')} value={formatPrice(subtotal)} />
                {discount > 0 && (
                  <Line label={tx('discount', 'Remise')} value={`- ${formatPrice(discount)}`} accent />
                )}
                <Line label={tx('vat', 'TVA (est.)')} value={tax > 0 ? formatPrice(tax) : '—'} />
                <Line label={tx('shipping', 'Livraison')} value={shipping === 0 ? 'Offerte' : formatPrice(shipping)} />
                <div className="border-t border-gray-300 dark:border-zinc-700 my-2" />
                <Line label={tx('total', 'Total')} value={formatPrice(payable)} bold />
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-2 gap-2 px-4 py-3">
                <Link
                  href={gotoCart}
                  onClick={() => onCta('voir_panier')}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={tx('view_cart', 'Voir le panier')}
                >
                  {tx('view_cart', 'Voir le panier')}
                </Link>
                <Link
                  href={gotoCheckout}
                  onClick={() => onCta('commander')}
                  className="inline-flex items-center justify-center rounded-lg bg-accent text-white px-3 py-2 text-sm font-extrabold shadow-md hover:bg-accent/90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={tx('checkout', 'Commander')}
                >
                  {tx('checkout', 'Commander')} →
                </Link>
              </div>

              {/* Trust line */}
              <div className="px-4 pb-3 -mt-1">
                <ul className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                  <li className="flex items-center gap-1">✅ {tx('secure_payment', 'Paiement sécurisé')}</li>
                  <li className="flex items-center gap-1">🚀 {tx('fast_shipping', '48h')}</li>
                  <li className="flex items-center gap-1">💬 {tx('support', 'Support 7j/7')}</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </AnimatePresence>
  );
}

function Line({ label, value, bold = false, accent = false }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-gray-700 dark:text-gray-300', bold && 'font-semibold')}>{label}</span>
      <span
        className={cn(
          'tabular-nums text-gray-900 dark:text-white',
          bold && 'font-semibold',
          accent && 'text-emerald-600 dark:text-emerald-400 font-semibold'
        )}
        aria-label={label}
      >
        {value}
      </span>
    </div>
  );
}
