// src/components/cart/CartSummary.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import FreeShippingBadge from '@/components/FreeShippingBadge';

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
  shippingThreshold = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 49),
  shippingFee = Number(process.env.NEXT_PUBLIC_FLAT_SHIPPING_FEE ?? 4.9),
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
        'space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-zinc-700',
        className
      )}
      role="region"
      aria-labelledby="cart-summary-title"
    >
      {/* Live region pour lecteurs d’écran */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <h2 id="cart-summary-title" className="text-xl font-bold text-gray-900 dark:text-white">
        🧾 Résumé de la commande
      </h2>

      {/* Progression livraison gratuite */}
      <div className="pt-1">
        <FreeShippingBadge price={taxableBase} withProgress />
      </div>

      {/* Lignes montants */}
      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
        <hr className="border-gray-300 dark:border-zinc-700 my-3" />
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
          <div className="flex items-center justify-between rounded-lg border border-emerald-300/70 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm">
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              Code appliqué&nbsp;: {applied}
            </span>
            <button
              onClick={removeCoupon}
              className="text-emerald-700/90 hover:underline dark:text-emerald-300"
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
              className="flex-1 rounded-md border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              aria-describedby="coupon-help"
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className={cn(
                'rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40',
                !code.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/90'
              )}
              aria-label="Appliquer le code promo"
            >
              Appliquer
            </button>
          </form>
        )}
        <p id="coupon-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400" role="status">
          {msg}
        </p>
      </div>

      {/* Note légale */}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
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
      <span className={cn('text-gray-700 dark:text-gray-300', bold && 'font-semibold', big && 'text-base')}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums text-gray-900 dark:text-white',
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
