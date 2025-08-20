// src/components/FreeShippingBadge.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';

interface FreeShippingBadgeProps {
  /** Montant pris en compte (ex: prix produit OU total panier) */
  price: number;
  /** Seuil de livraison gratuite (fallback env or 49€) */
  threshold?: number;
  className?: string;
  /** Version compacte (pas de barre de progression) */
  minimal?: boolean;
  /** Forcer l’affichage de la progression (ignoré si minimal) */
  withProgress?: boolean;
  /** Locale pour le texte ('fr', 'fr-FR', 'en', etc.) */
  locale?: string;
}

export default function FreeShippingBadge({
  price,
  threshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 49),
  className,
  minimal = false,
  withProgress = !minimal,
  locale = 'fr',
}: FreeShippingBadgeProps) {
  const prefersReduced = useReducedMotion();

  // sanity checks
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(threshold) || threshold <= 0) return null;

  const isFr = String(locale).toLowerCase().startsWith('fr');

  const T = {
    eligibleShort: isFr ? '✅ Livraison offerte' : '✅ Free shipping',
    eligibleLong: isFr ? '🚚 Livraison gratuite' : '🚚 Free shipping',
    missing: (amt: number) =>
      isFr ? `Plus que ${formatPrice(amt)} pour la livraison gratuite` : `Only ${formatPrice(amt)} away from free shipping`,
    srEligible: (thr: number) =>
      isFr
        ? `Seuil de livraison gratuite atteint (seuil ${formatPrice(thr)}).`
        : `Free shipping unlocked (threshold ${formatPrice(thr)}).`,
    srMissing: (rem: number, thr: number) =>
      isFr
        ? `Il manque ${formatPrice(rem)} pour atteindre la livraison gratuite (seuil ${formatPrice(thr)}).`
        : `You need ${formatPrice(rem)} more to unlock free shipping (threshold ${formatPrice(thr)}).`,
    progressLabel: isFr ? 'Progression vers la livraison gratuite' : 'Progress toward free shipping',
  };

  const remaining = Math.max(0, threshold - price);
  const isEligible = remaining <= 0;
  const progress = Math.min(100, Math.round((price / threshold) * 100));

  const baseStyle =
    'inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg transition shadow-sm';
  const eligibleStyle =
    'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border border-green-200/70 dark:border-green-700/40';
  const alertStyle =
    'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200/60 dark:border-yellow-700/40';

  const text = isEligible
    ? minimal
      ? T.eligibleShort
      : T.eligibleLong
    : T.missing(remaining);

  const showProgress = withProgress && !minimal; // affichage même quand atteint (barre 100%)

  return (
    <div className={cn('inline-flex flex-col min-w-[10rem]', className)} title={text}>
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 6 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        role={isEligible ? 'status' : 'alert'}
        aria-live="polite"
        className={cn(baseStyle, isEligible ? eligibleStyle : alertStyle)}
      >
        <span aria-hidden="true">{isEligible ? '✅' : '🚚'}</span>
        <span>{text}</span>
      </motion.div>

      {/* Barre de progression (optionnelle) */}
      {showProgress && (
        <div
          className="mt-1 h-1.5 w-full rounded-full bg-gray-200/80 dark:bg-zinc-800/80 overflow-hidden"
          role="progressbar"
          aria-label={T.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={
            isEligible
              ? (isFr ? '100% atteint' : '100% reached')
              : (isFr ? `${progress}% atteint` : `${progress}% reached`)
          }
        >
          <motion.div
            className={cn(
              'h-full rounded-full',
              isEligible ? 'bg-green-500' : 'bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: prefersReduced ? 0 : 0.6, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Texte SR supplémentaire (annonce claire du statut) */}
      <span className="sr-only" role="status" aria-live="polite">
        {isEligible ? T.srEligible(threshold) : T.srMissing(remaining, threshold)}
      </span>
    </div>
  );
}
