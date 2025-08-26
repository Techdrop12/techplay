// src/components/FreeShippingBadge.tsx — PREMIUM (SVG icons, no emoji) — FINAL
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface FreeShippingBadgeProps {
  price: number;
  threshold?: number;
  className?: string;
  minimal?: boolean;
  withProgress?: boolean;
  locale?: string;
  variant?: 'bar' | 'ring';
  size?: 'sm' | 'md';
  celebrate?: boolean;
  onReach?: () => void;
  persistKey?: string;
  policyHref?: string;
  ringMode?: 'conic' | 'svg';
}

/* ------------------------ Premium inline icons ------------------------ */

function IconCheckCircle({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm-1.1 13.3-3.2-3.2 1.4-1.4 1.8 1.8 4.8-4.8 1.4 1.4-6.2 6.2Z"
      />
    </svg>
  );
}

function IconTruck({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M3 6h11a1 1 0 0 1 1 1v3h3.8c.4 0 .76.24.92.62l1.28 3.02c.06.15.1.31.1.47V18a2 2 0 0 1-2 2h-1a2.5 2.5 0 1 1-5 0H9.5a2.5 2.5 0 1 1-5 0H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm12 4V8H4v10h.51a2.5 2.5 0 0 1 4.98 0H15v-5h3.67l-.8-1.9H15Zm2.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM7 19.5A1.5 1.5 0 1 0 7 16a1.5 1.5 0 0 0 0 3.5Z"
      />
    </svg>
  );
}

/** Mini confettis vectoriels (sans emoji) */
function ConfettiSVG() {
  return (
    <div aria-hidden className="relative -ml-1">
      <motion.svg
        initial={{ y: 4, opacity: 0, rotate: -12 }}
        animate={{ y: -10, opacity: 1, rotate: -18 }}
        transition={{ duration: 0.6 }}
        width="10" height="10" viewBox="0 0 10 10" className="absolute -top-2 left-0"
      >
        <circle cx="5" cy="5" r="5" fill="currentColor" className="opacity-80" />
      </motion.svg>
      <motion.svg
        initial={{ y: 4, opacity: 0, rotate: 12 }}
        animate={{ y: -12, opacity: 1, rotate: 18 }}
        transition={{ duration: 0.65, delay: 0.05 }}
        width="10" height="10" viewBox="0 0 10 10" className="absolute -top-1 left-3"
      >
        <rect x="1.5" y="1.5" width="7" height="7" rx="1.5" fill="currentColor" className="opacity-70" />
      </motion.svg>
      <motion.svg
        initial={{ y: 4, opacity: 0, rotate: 0 }}
        animate={{ y: -9, opacity: 1, rotate: 8 }}
        transition={{ duration: 0.62, delay: 0.08 }}
        width="10" height="10" viewBox="0 0 10 10" className="absolute -top-2 left-5"
      >
        <path d="M5 0l5 10H0L5 0Z" fill="currentColor" className="opacity-60" />
      </motion.svg>
    </div>
  );
}

/* --------------------------------------------------------------------- */

export default function FreeShippingBadge({
  price,
  threshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 49),
  className,
  minimal = false,
  withProgress = !minimal,
  locale,
  variant = 'bar',
  size = 'md',
  celebrate = true,
  onReach,
  persistKey,
  policyHref,
  ringMode = 'conic',
}: FreeShippingBadgeProps) {
  const prefersReduced = useReducedMotion();

  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(threshold) || threshold <= 0) return null;

  const autoLocale =
    locale || (typeof document !== 'undefined' ? (document.documentElement.lang || 'fr') : 'fr');
  const isFr = String(autoLocale).toLowerCase().startsWith('fr');

  const T = {
    eligibleShort: isFr ? 'Livraison offerte' : 'Free shipping',
    eligibleLong: isFr ? 'Livraison gratuite' : 'Free shipping',
    missing: (amt: number) =>
      isFr
        ? 'Plus que ' + formatPrice(amt) + ' pour la livraison gratuite'
        : 'Only ' + formatPrice(amt) + ' away from free shipping',
    srEligible: (thr: number) =>
      isFr
        ? 'Seuil de livraison gratuite atteint (seuil ' + formatPrice(thr) + ').'
        : 'Free shipping unlocked (threshold ' + formatPrice(thr) + ').',
    srMissing: (rem: number, thr: number) =>
      isFr
        ? 'Il manque ' + formatPrice(rem) + ' pour atteindre la livraison gratuite (seuil ' + formatPrice(thr) + ').'
        : 'You need ' + formatPrice(rem) + ' more to unlock free shipping (threshold ' + formatPrice(thr) + ').',
    progressLabel: isFr ? 'Progression vers la livraison gratuite' : 'Progress toward free shipping',
    policy: isFr ? 'Voir conditions' : 'See policy',
  };

  const remaining = Math.max(0, threshold - price);
  const isEligible = remaining <= 0;
  const progress = Math.min(100, Math.round((price / threshold) * 100));

  const [reachedPersisted, setReachedPersisted] = useState(false);
  useEffect(() => {
    if (!persistKey) return;
    try {
      const raw = sessionStorage.getItem(persistKey);
      setReachedPersisted(raw === '1');
    } catch {}
  }, [persistKey]);

  const reachedOnce = useRef(false);
  useEffect(() => {
    if (isEligible) {
      if (!reachedOnce.current) {
        reachedOnce.current = true;
        try { onReach?.() } catch {}
        try { (window as any).dataLayer?.push({ event: 'free_shipping_reached', threshold }) } catch {}
        if (persistKey) {
          try { sessionStorage.setItem(persistKey, '1') } catch {}
        }
      }
    } else {
      reachedOnce.current = false;
    }
  }, [isEligible, onReach, threshold, persistKey]);

  const Confetti = () =>
    celebrate && isEligible && !prefersReduced && !reachedPersisted ? <ConfettiSVG /> : null;

  // Ring sizes
  const ringDim = size === 'sm' ? 36 : 44;
  const ringStroke = size === 'sm' ? 4 : 5;

  // Chip styles
  const baseChip =
    'inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg transition shadow-sm border';
  const okChip =
    'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border-green-200/70 dark:border-green-700/40';
  const warnChip =
    'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200/60 dark:border-yellow-700/40';

  const showProgress = withProgress && !minimal;

  /* ----------------------- RING variant ----------------------- */
  if (variant === 'ring' && showProgress) {
    const pct = Math.max(0, progress);

    if (ringMode === 'svg') {
      const r = (ringDim - ringStroke) / 2;
      const c = 2 * Math.PI * r;
      const filled = (pct / 100) * c;
      const offset = c - filled;

      return (
        <div
          className={cn('inline-flex items-center gap-3', className)}
          data-eligible={isEligible ? 'true' : 'false'}
          title={isEligible ? (minimal ? T.eligibleShort : T.eligibleLong) : T.missing(remaining)}
        >
          <div
            className="relative grid place-items-center rounded-full"
            role="progressbar"
            aria-label={T.progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-valuetext={isEligible ? (isFr ? '100% atteint' : '100% reached') : String(pct) + '%'}
            style={{ width: ringDim, height: ringDim }}
          >
            <svg width={ringDim} height={ringDim} viewBox={'0 0 ' + ringDim + ' ' + ringDim} className="rotate-[-90deg]">
              <circle
                cx={ringDim / 2}
                cy={ringDim / 2}
                r={r}
                stroke="currentColor"
                className="text-[hsl(var(--accent)/.15)]"
                strokeWidth={ringStroke}
                fill="none"
              />
              <motion.circle
                cx={ringDim / 2}
                cy={ringDim / 2}
                r={r}
                stroke="currentColor"
                className="text-[hsl(var(--accent))]"
                strokeWidth={ringStroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={c}
                strokeDashoffset={prefersReduced ? offset : c}
                animate={prefersReduced ? undefined : { strokeDashoffset: offset }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-1 grid place-items-center rounded-full bg-white dark:bg-zinc-900" aria-hidden>
              {isEligible ? <IconCheckCircle className="text-green-600 dark:text-green-400" /> : <IconTruck className="text-[hsl(var(--accent))]" />}
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
              <span>{isEligible ? (minimal ? T.eligibleShort : T.eligibleLong) : T.missing(remaining)}</span>
              {policyHref && (
                <a
                  href={policyHref}
                  className="ml-2 underline decoration-dotted underline-offset-2"
                  onClick={() => { try { (window as any).dataLayer?.push({ event: 'free_shipping_policy_click' }) } catch {} }}
                >
                  {T.policy}
                </a>
              )}
            </div>
          </div>

          <span className="sr-only" role="status" aria-live="polite">
            {isEligible ? T.srEligible(threshold) : T.srMissing(remaining, threshold)}
          </span>
        </div>
      );
    }

    // conic-gradient fallback
    const ringBg =
      'conic-gradient(hsl(var(--accent)) ' +
      pct +
      '%, hsl(var(--accent)/.15) ' +
      pct +
      '% 100%)';

    return (
      <div
        className={cn('inline-flex items-center gap-3', className)}
        data-eligible={isEligible ? 'true' : 'false'}
        title={isEligible ? (minimal ? T.eligibleShort : T.eligibleLong) : T.missing(remaining)}
      >
        <div
          className="relative grid place-items-center rounded-full"
          style={{ width: ringDim, height: ringDim, backgroundImage: ringBg }}
          role="progressbar"
          aria-label={T.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={isEligible ? (isFr ? '100% atteint' : '100% reached') : String(pct) + '%'}
        >
          <div
            className="grid place-items-center rounded-full bg-white dark:bg-zinc-900"
            style={{ width: ringDim - ringStroke * 2, height: ringDim - ringStroke * 2 }}
            aria-hidden
          >
            {isEligible ? <IconCheckCircle className="text-green-600 dark:text-green-400" /> : <IconTruck className="text-[hsl(var(--accent))]" />}
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
            <span>{isEligible ? (minimal ? T.eligibleShort : T.eligibleLong) : T.missing(remaining)}</span>
            {policyHref && (
              <a
                href={policyHref}
                className="ml-2 underline decoration-dotted underline-offset-2"
                onClick={() => { try { (window as any).dataLayer?.push({ event: 'free_shipping_policy_click' }) } catch {} }}
              >
                {T.policy}
              </a>
            )}
          </div>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {isEligible ? T.srEligible(threshold) : T.srMissing(remaining, threshold)}
        </span>
      </div>
    );
  }

  /* ----------------------- BAR variant (default) ----------------------- */
  const text = isEligible ? (minimal ? T.eligibleShort : T.eligibleLong) : T.missing(remaining);

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
        <span aria-hidden="true" className="inline-flex">
          {isEligible ? <IconCheckCircle className="text-green-600 dark:text-green-400" /> : <IconTruck className="text-[hsl(var(--accent))]" />}
        </span>
        <span>{text}</span>
        {policyHref && (
          <a
            href={policyHref}
            className="ml-2 underline decoration-dotted underline-offset-2"
            onClick={() => { try { (window as any).dataLayer?.push({ event: 'free_shipping_policy_click' }) } catch {} }}
          >
            {T.policy}
          </a>
        )}
      </motion.div>

      {withProgress && (
        <div
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200/80 dark:bg-zinc-800/80"
          role="progressbar"
          aria-label={T.progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={isEligible ? (isFr ? '100% atteint' : '100% reached') : String(progress) + '%'}
        >
          <motion.div
            className={cn(
              'h-full rounded-full',
              isEligible
                ? 'bg-green-500'
                : 'bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent)/.85),hsl(var(--accent)/.7))]'
            )}
            initial={{ width: 0 }}
            animate={{ width: String(progress) + '%' }}
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
