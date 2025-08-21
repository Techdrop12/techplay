// src/components/FreeShippingBadge.tsx — ultimate: ring/bar variants + celebrate + a11y
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useEffect, useMemo, useRef } from 'react';

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
  /** Style visuel de progression */
  variant?: 'bar' | 'ring';
  /** Taille du composant */
  size?: 'sm' | 'md';
  /** Déclenche une petite célébration à l’atteinte du seuil */
  celebrate?: boolean;
  /** Callback appelé une seule fois lorsqu’on atteint le seuil */
  onReach?: () => void;
}

export default function FreeShippingBadge({
  price,
  threshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 49),
  className,
  minimal = false,
  withProgress = !minimal,
  locale = 'fr',
  variant = 'bar',
  size = 'md',
  celebrate = true,
  onReach,
}: FreeShippingBadgeProps) {
  const prefersReduced = useReducedMotion();

  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(threshold) || threshold <= 0) return null;

  const isFr = String(locale).toLowerCase().startsWith('fr');

  const T = {
    eligibleShort: isFr ? '✅ Livraison offerte' : '✅ Free shipping',
    eligibleLong: isFr ? '🚚 Livraison gratuite' : '🚚 Free shipping',
    missing: (amt: number) =>
      isFr
        ? `Plus que ${formatPrice(amt)} pour la livraison gratuite`
        : `Only ${formatPrice(amt)} away from free shipping`,
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

  // Fire onReach une seule fois au franchissement
  const reachedOnce = useRef(false);
  useEffect(() => {
    if (!reachedOnce.current && isEligible) {
      reachedOnce.current = true;
      try { onReach?.() } catch {}
    }
    if (!isEligible) reachedOnce.current = false;
  }, [isEligible, onReach]);

  // Texte principal
  const text = useMemo(
    () => (isEligible ? (minimal ? T.eligibleShort : T.eligibleLong) : T.missing(remaining)),
    [isEligible, minimal, remaining]
  );

  // Tailles ring
  const ringDim = size === 'sm' ? 36 : 44;
  const ringStroke = size === 'sm' ? 4 : 5;

  // Styles
  const baseChip =
    'inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg transition shadow-sm border';
  const okChip =
    'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border-green-200/70 dark:border-green-700/40';
  const warnChip =
    'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200/60 dark:border-yellow-700/40';

  const showProgress = withProgress && !minimal;

  // Confetti simple (3 paillettes Motion, pas de dep)
  const Confetti = () =>
    celebrate && isEligible && !prefersReduced ? (
      <div aria-hidden className="relative -ml-1">
        <motion.span
          className="absolute -top-2 left-0 text-[10px] select-none"
          initial={{ y: 4, opacity: 0, rotate: -12 }}
          animate={{ y: -10, opacity: 1, rotate: -18 }}
          transition={{ duration: 0.6 }}
        >
          🎉
        </motion.span>
        <motion.span
          className="absolute -top-1 left-3 text-[10px] select-none"
          initial={{ y: 4, opacity: 0, rotate: 12 }}
          animate={{ y: -12, opacity: 1, rotate: 18 }}
          transition={{ duration: 0.65, delay: 0.05 }}
        >
          ✨
        </motion.span>
        <motion.span
          className="absolute -top-2 left-5 text-[10px] select-none"
          initial={{ y: 4, opacity: 0, rotate: 0 }}
          animate={{ y: -9, opacity: 1, rotate: 8 }}
          transition={{ duration: 0.62, delay: 0.08 }}
        >
          confetti
        </motion.span>
      </div>
    ) : null;

  // Variante anneau (conic-gradient), sinon barre
  if (variant === 'ring' && showProgress) {
    const pct = Math.max(0, progress);
    const ringBg = `conic-gradient(hsl(var(--accent)) ${pct}%, hsl(var(--accent)/.15) ${pct}% 100%)`;
    return (
      <div
        className={cn('inline-flex items-center gap-3', className)}
        data-eligible={isEligible ? 'true' : 'false'}
        title={text}
      >
        <div
          className="relative grid place-items-center rounded-full"
          style={{ width: ringDim, height: ringDim, backgroundImage: ringBg }}
          role="progressbar"
          aria-label={T.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={isEligible ? (isFr ? '100% atteint' : '100% reached') : `${pct}%`}
        >
          <div
            className="grid place-items-center rounded-full bg-white dark:bg-zinc-900"
            style={{ width: ringDim - ringStroke * 2, height: ringDim - ringStroke * 2 }}
          >
            <span aria-hidden className="text-xs">{isEligible ? '✅' : '🚚'}</span>
          </div>
          {isEligible && <span className="absolute inset-0 rounded-full shadow-glow-accent pointer-events-none" aria-hidden />}
        </div>

        <div className="min-w-[8.5rem]">
          <div
            className={cn(baseChip, isEligible ? okChip : warnChip, 'px-2.5 py-1')}
            role={isEligible ? 'status' : 'alert'}
            aria-live="polite"
          >
            <Confetti />
            <span>{text}</span>
          </div>
        </div>

        {/* SR live text (clair) */}
        <span className="sr-only" role="status" aria-live="polite">
          {isEligible ? T.srEligible(threshold) : T.srMissing(remaining, threshold)}
        </span>
      </div>
    );
  }

  // Variante barre (par défaut)
  return (
    <div
      className={cn('inline-flex min-w-[10rem] flex-col', className)}
      title={text}
      data-eligible={isEligible ? 'true' : 'false'}
    >
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 6 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        role={isEligible ? 'status' : 'alert'}
        aria-live="polite"
        className={cn(baseChip, isEligible ? okChip : warnChip)}
      >
        <Confetti />
        <span aria-hidden="true">{isEligible ? '✅' : '🚚'}</span>
        <span>{text}</span>
      </motion.div>

      {showProgress && (
        <div
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-zinc-800/80"
          role="progressbar"
          aria-label={T.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={isEligible ? (isFr ? '100% atteint' : '100% reached') : `${progress}%`}
        >
          <motion.div
            className={cn(
              'h-full rounded-full',
              isEligible
                ? 'bg-green-500'
                : 'bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent)/.85),hsl(var(--accent)/.7))]'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: prefersReduced ? 0 : 0.6, ease: 'easeOut' }}
          />
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {isEligible ? T.srEligible(threshold) : T.srMissing(remaining, threshold)}
      </span>
    </div>
  );
}
