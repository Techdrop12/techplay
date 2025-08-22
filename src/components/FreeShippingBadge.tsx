// src/components/FreeShippingBadge.tsx — ULTIME++ (ring/svg, persist, policy link, a11y/UX)
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  /** Locale ('fr', 'fr-FR', 'en', etc.) — par défaut <html lang> ou 'fr' */
  locale?: string;
  /** Style visuel de progression */
  variant?: 'bar' | 'ring';
  /** Taille du composant */
  size?: 'sm' | 'md';
  /** Déclenche une petite célébration à l’atteinte du seuil */
  celebrate?: boolean;
  /** Callback appelé une seule fois lorsqu’on atteint le seuil */
  onReach?: () => void;

  /** Persister le “déjà atteint” (évite de rejouer les confettis) */
  persistKey?: string;
  /** Afficher un lien vers la politique d’expédition (facultatif) */
  policyHref?: string;
  /** Mode d’anneau : conic (par défaut) ou svg pour un stroke animé lisse */
  ringMode?: 'conic' | 'svg';
}

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

  // Locale auto depuis <html lang> si non fournie
  const autoLocale =
    locale ||
    (typeof document !== 'undefined' ? (document.documentElement.lang || 'fr') : 'fr');
  const isFr = String(autoLocale).toLowerCase().startsWith('fr');

  const T = {
    eligibleShort: isFr ? '✅ Livraison offerte' : '✅ Free shipping',
    eligibleLong: isFr ? '🚚 Livraison gratuite' : '🚚 Free shipping',
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

  // Persist confetti/reach (session) pour éviter de spam
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
        // dataLayer pour analytics
        try { (window as any).dataLayer?.push({ event: 'free_shipping_reached', threshold }) } catch {}
        // persist (session)
        if (persistKey) {
          try { sessionStorage.setItem(persistKey, '1') } catch {}
        }
      }
    } else {
      reachedOnce.current = false;
    }
  }, [isEligible, onReach, threshold, persistKey]);

  // Confetti simple (Motion emojis) désactivé si déjà “vu” (persist)
  const Confetti = () =>
    celebrate && isEligible && !prefersReduced && !reachedPersisted ? (
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
          🎊
        </motion.span>
      </div>
    ) : null;

  // Tailles ring
  const ringDim = size === 'sm' ? 36 : 44;
  const ringStroke = size === 'sm' ? 4 : 5;

  // Styles chip
  const baseChip =
    'inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-lg transition shadow-sm border';
  const okChip =
    'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300 border-green-200/70 dark:border-green-700/40';
  const warnChip =
    'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200/60 dark:border-yellow-700/40';

  const showProgress = withProgress && !minimal;

  /* ───────────── RING variant ───────────── */
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
            <div
              className="absolute inset-1 grid place-items-center rounded-full bg-white dark:bg-zinc-900"
              aria-hidden
            >
              <span className="text-xs">{isEligible ? '✅' : '🚚'}</span>
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

    // conic-gradient fallback (léger)
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
            <span className="text-xs">{isEligible ? '✅' : '🚚'}</span>
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

  /* ───────────── BAR variant (par défaut) ───────────── */
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
        <span aria-hidden="true">{isEligible ? '✅' : '🚚'}</span>
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
