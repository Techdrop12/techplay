'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Product } from '@/types/product';

import FreeShippingBadge from '@/components/FreeShippingBadge';
import Link from '@/components/LocalizedLink';
import { UI } from '@/lib/constants';
import { cn, formatPrice } from '@/lib/utils';

type CouponSpec =
  | { type: 'percent'; value: number } // ex: 10 = -10%
  | { type: 'amount'; value: number } // ex: 5  = -5 €
  | { type: 'freeship' }; // livraison offerte

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
  const t = useTranslations('cart');
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

  const itemsCount = useMemo(() => safeItems.reduce((s, it) => s + it.quantity, 0), [safeItems]);

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
    setMsg(t('code_removed'));
    announce(t('announce_removed'));
    if (typeof window !== 'undefined') localStorage.removeItem(LS_COUPON_KEY);
    onCouponRemoved?.(prev);
  };

  return (
    <section
      className={cn(
        'card space-y-5 rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.18)]',
        className
      )}
      role="region"
      aria-labelledby="cart-summary-title"
    >
      {/* Live region pour lecteurs d’écran */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <h2
        id="cart-summary-title"
        className="text-lg font-bold tracking-tight text-[hsl(var(--text))] border-b border-[hsl(var(--border))] pb-3"
      >
        {t('summary_title')}
      </h2>

      {/* Progression livraison gratuite */}
      <div className="pt-1">
        <FreeShippingBadge price={taxableBase} withProgress />
      </div>

      <div className="space-y-1.5 text-[13px] text-token-text/80">
        <Row
          label={`${t('subtotal')} (${t('items_count', { count: itemsCount })})`}
          value={formatPrice(subtotal)}
        />
        {discount > 0 && (
          <Row
            label={`${t('discount_label')}${applied ? ` (${applied})` : ''}`}
            value={`- ${formatPrice(discount)}`}
            valueClass="text-emerald-600 dark:text-emerald-400 font-semibold"
          />
        )}
        <Row label={t('vat_est')} value={taxRate > 0 ? formatPrice(tax) : '—'} />
        <Row
          label={t('shipping')}
          value={shipping === 0 ? t('shipping_free') : formatPrice(shipping)}
        />
      </div>
      <hr className="border-[hsl(var(--border))]" />
      <div className="flex items-baseline justify-between gap-4 py-1">
        <span className="text-base font-bold text-[hsl(var(--text))]">Total</span>
        <span
          className="text-xl font-extrabold tabular-nums text-[hsl(var(--text))]"
          aria-label={t('total')}
        >
          {formatPrice(total)}
        </span>
      </div>

      {/* Économies totales */}
      {savings > 0 && (
        <p className="text-[12px] text-emerald-600 dark:text-emerald-400">
          {t('you_save', { amount: formatPrice(savings) })}
          {applied ? ` (${applied})` : ''}
        </p>
      )}

      <Link
        href="/commande"
        className="btn-premium flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
        aria-label={t('checkout_btn_aria')}
      >
        {t('checkout_btn')}
        <span aria-hidden="true">→</span>
      </Link>

      <p className="text-[11px] text-token-text/60">
        {t('footer_secure', { threshold: formatPrice(shippingThreshold) })}
      </p>

      <div className="space-y-2 border-t border-[hsl(var(--border))] pt-4">
        {applied ? (
          <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3 py-2 text-[12px]">
            <span className="text-token-text/80">
              {t('code_label')} {applied}
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-[12px] text-token-text/70 underline underline-offset-1 transition hover:text-[hsl(var(--accent))]"
              aria-label={t('remove_code_aria')}
            >
              {t('remove_code')}
            </button>
          </div>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              applyCoupon(code);
            }}
            aria-label={t('coupon_aria')}
          >
            <input
              type="text"
              autoComplete="off"
              placeholder={t('coupon_placeholder')}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="min-w-0 flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
              aria-describedby="coupon-help"
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className={cn(
                'shrink-0 rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-[12px] font-medium transition hover:bg-[hsl(var(--surface))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
                !code.trim() && 'cursor-not-allowed opacity-50'
              )}
              aria-label={t('apply_code')}
            >
              OK
            </button>
          </form>
        )}
        <p id="coupon-help" className="text-[11px] text-token-text/60" role="status">
          {msg}
        </p>
      </div>
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
