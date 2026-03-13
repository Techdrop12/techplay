'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { Product } from '@/types/product'

import FreeShippingBadge from '@/components/FreeShippingBadge'
import Link from '@/components/LocalizedLink'
import { UI } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

type CouponSpec =
  | { type: 'percent'; value: number } // ex: 10 = -10%
  | { type: 'amount'; value: number }  // ex: 5  = -5 €
  | { type: 'freeship' };              // livraison offerte

interface CartSummaryProps {
  items: (Product & { quantity: number })[];
  /** Taux de TVA (ex: 0.2 = 20%). Mettre 0 si prix TTC déjà fournis. */
  taxRate?: number;
  /** Seuil de livraison gratuite (par défaut env ou 49€) */
  shippingThreshold?: number;
  /** Frais de livraison si sous le seuil */
  shippingFee?: number;
  /** Dictionnaire de codes promos disponibles (clé = code) */
  couponCodes?: Record<string, CouponSpec>;
  /** Callback quand un coupon est appliqué */
  onCouponApplied?: (code: string) => void;
  /** Callback quand un coupon est retiré */
  onCouponRemoved?: (code: string) => void;
  className?: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const LS_COUPON_KEY = 'cart_coupon_code';

const DEFAULT_COUPONS: Record<string, CouponSpec> = {
  WELCOME10: { type: 'percent', value: 10 },
  VIP20: { type: 'percent', value: 20 },
  FREESHIP: { type: 'freeship' },
};

export default function CartSummary({
  items,
  taxRate = 0.2,
  shippingThreshold = UI.FREE_SHIPPING_THRESHOLD,
  shippingFee = UI.FLAT_SHIPPING_FEE,
  couponCodes = DEFAULT_COUPONS,
  onCouponApplied,
  onCouponRemoved,
  className = '',
}: CartSummaryProps) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [msg, setMsg] = useState('');
  const srRef = useRef<HTMLParagraphElement | null>(null);

  // Hydrate code appliqué depuis localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (window.localStorage.getItem(LS_COUPON_KEY) || '').toUpperCase();
    if (saved && couponCodes[saved]) setApplied(saved);
  }, [couponCodes]);

  /** ---- Totaux ---- */
  const safeItems = useMemo(
    () =>
      (items ?? []).map((it) => ({
        price: Number(it.price) || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
      })),
    [items]
  );

  const itemsCount = useMemo(
    () => safeItems.reduce((s, it) => s + it.quantity, 0),
    [safeItems]
  );

  const subtotal = useMemo(
    () => round2(safeItems.reduce((s, it) => s + it.price * it.quantity, 0)),
    [safeItems]
  );

  const discount = useMemo(() => {
    if (!applied) return 0;
    const spec = couponCodes[applied];
    if (!spec) return 0;
    if (spec.type === 'percent') return round2((subtotal * spec.value) / 100);
    if (spec.type === 'amount') return round2(Math.min(spec.value, subtotal));
    return 0;
  }, [applied, couponCodes, subtotal]);

  const taxableBase = Math.max(0, subtotal - discount);

  const hasFreeShipCode = applied && couponCodes[applied]?.type === 'freeship';
  const eligibleForFreeShip = taxableBase >= shippingThreshold || !!hasFreeShipCode;
  const shipping = eligibleForFreeShip ? 0 : shippingFee;

  const tax = round2(taxRate > 0 ? taxableBase * taxRate : 0);

  const total = round2(taxableBase + tax + shipping);

  const savings = useMemo(
    () => round2(discount + (eligibleForFreeShip ? shippingFee : 0)),
    [discount, eligibleForFreeShip, shippingFee]
  );

  /** ---- Coupon ---- */
  const announce = (text: string) => {
    if (srRef.current) srRef.current.textContent = text;
  };

  const applyCoupon = (raw: string) => {
    const c = (raw || '').trim().toUpperCase();
    if (!c) return;
    if (!couponCodes[c]) {
      setMsg('Code invalide.');
      announce('Code promo invalide');
      return;
    }
    setApplied(c);
    setMsg('Code appliqué ✔︎');
    announce(`Code ${c} appliqué`);
    if (typeof window !== 'undefined') localStorage.setItem(LS_COUPON_KEY, c);
    onCouponApplied?.(c);
  };

  const removeCoupon = () => {
    if (!applied) return;
    const prev = applied;
    setApplied('');
    setMsg('Code retiré.');
    announce('Code promo retiré');
    if (typeof window !== 'undefined') localStorage.removeItem(LS_COUPON_KEY);
    onCouponRemoved?.(prev);
  };

  return (
    <section
      className={cn(
        'card space-y-5 p-6 shadow-[var(--shadow-lg)]',
        className
      )}
      role="region"
      aria-labelledby="cart-summary-title"
    >
      {/* Live region pour lecteurs d’écran */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <h2 id="cart-summary-title" className="text-lg font-bold tracking-tight text-[hsl(var(--text))] sm:text-xl [letter-spacing:var(--heading-tracking)]">
        Résumé de la commande
      </h2>

      {/* Progression livraison gratuite */}
      <div className="pt-1">
        <FreeShippingBadge price={taxableBase} withProgress />
      </div>

      <div className="space-y-2 text-[13px] text-token-text/80">
        <Row
          label={`Sous-total (${itemsCount} article${itemsCount > 1 ? 's' : ''})`}
          value={formatPrice(subtotal)}
        />
        {discount > 0 && (
          <Row
            label={`Remise${applied ? ` (${applied})` : ''}`}
            value={`- ${formatPrice(discount)}`}
            valueClass="text-emerald-600 dark:text-emerald-400 font-semibold"
          />
        )}
        <Row label="TVA (est.)" value={taxRate > 0 ? formatPrice(tax) : '—'} />
        <Row label="Livraison" value={shipping === 0 ? 'Offerte' : formatPrice(shipping)} />
        <hr className="my-3 border-[hsl(var(--border))]" />
        <Row label="Total" value={formatPrice(total)} bold big />
      </div>

      {/* Économies totales */}
      {savings > 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Vous économisez {formatPrice(savings)} {applied ? `avec le code ${applied}` : ''}.
        </p>
      )}

      {/* Zone code promo */}
      <div className="mt-4">
        {applied ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-[13px] dark:border-emerald-800/50 dark:bg-emerald-900/20">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              Code appliqué : {applied}
            </span>
            <button
              onClick={removeCoupon}
              className="rounded-lg px-2 py-1 font-medium text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-800/40"
              aria-label="Retirer le code promo"
            >
              Retirer
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyCoupon(code);
            }}
            aria-label="Appliquer un code promo"
          >
            <input
              type="text"
              autoComplete="off"
              placeholder="Code promo"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
              aria-describedby="coupon-help"
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className={cn(
                'btn-primary shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)]',
                !code.trim() && 'cursor-not-allowed opacity-50'
              )}
              aria-label="Appliquer le code promo"
            >
              Appliquer
            </button>
          </form>
        )}
        <p id="coupon-help" className="mt-1 text-xs text-token-text/70" role="status">
          {msg}
        </p>
      </div>

      {/* CTA principal : passer commande */}
      <Link
        href="/commande"
        className="btn-premium mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
        aria-label="Passer commande et payer"
        prefetch={false}
      >
        Passer commande
        <span aria-hidden="true">→</span>
      </Link>

      <p className="text-center text-[12px] text-token-text/70">
        Paiement sécurisé · Livraison offerte dès {formatPrice(shippingThreshold)}
      </p>

      {/* Note légale */}
      <p className="text-[11px] text-token-text/70 leading-relaxed">
        Montants estimatifs. Le calcul final des taxes et frais s’effectue au paiement.
        Livraison offerte dès {formatPrice(shippingThreshold)} après remise.
      </p>
    </section>
  );
}

function Row({
  label,
  value,
  bold = false,
  big = false,
  valueClass = '',
}: {
  label: string;
  value: string;
  bold?: boolean;
  big?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn('text-token-text/80', bold && 'font-semibold', big && 'text-base')}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums text-[hsl(var(--text))]',
          bold && 'font-semibold',
          big && 'text-lg',
          valueClass
        )}
        aria-label={label}
      >
        {value}
      </span>
    </div>
  );
}
