// src/components/checkout/OrderSummary.tsx — FINAL+ (locale/currency-friendly)
'use client';

import { useTranslations } from 'next-intl';

import { cn, formatPrice } from '@/lib/utils';

type Props = {
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  /** total (si fourni, affichage direct). Sinon: subtotal + shipping + tax - discount */
  total?: number;
  currency?: string;
  locale?: string;
  className?: string;
};

export default function OrderSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  currency = 'EUR',
  locale,
  className,
}: Props) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');

  const computed =
    typeof total === 'number'
      ? total
      : Math.max(0, (subtotal ?? 0) + (shipping ?? 0) + (tax ?? 0) - (discount ?? 0));

  const showBreakdown =
    typeof subtotal === 'number' ||
    typeof shipping === 'number' ||
    typeof tax === 'number' ||
    typeof discount === 'number';

  const fmt = (v: number) => formatPrice(v, { currency, locale });

  return (
    <section
      className={cn(
        'rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)] md:sticky md:top-6 md:self-start',
        className
      )}
      role="region"
      aria-labelledby="order-summary-title"
      aria-label={t('summary_aria')}
    >
      <h2
        id="order-summary-title"
        className="text-base font-semibold tracking-tight text-[hsl(var(--text))] border-b border-[hsl(var(--border))] pb-3 mb-4"
      >
        {t('summary_title')}
      </h2>

      {showBreakdown && (
        <dl className="space-y-2 text-[13px] text-token-text/80 mb-4">
          {typeof subtotal === 'number' && (
            <div className="flex justify-between items-center">
              <dt className="text-token-text/80">{tCart('subtotal')}</dt>
              <dd className="font-medium tabular-nums text-[hsl(var(--text))]">{fmt(subtotal)}</dd>
            </div>
          )}
          {typeof shipping === 'number' && (
            <div className="flex justify-between items-center">
              <dt className="text-token-text/80">{tCart('shipping')}</dt>
              <dd className="font-medium tabular-nums text-[hsl(var(--text))]">
                {shipping === 0 ? tCart('shipping_free') : fmt(shipping)}
              </dd>
            </div>
          )}
          {typeof tax === 'number' && (
            <div className="flex justify-between items-center">
              <dt className="text-token-text/80">{tCart('vat_est')}</dt>
              <dd className="font-medium tabular-nums text-[hsl(var(--text))]">{fmt(tax)}</dd>
            </div>
          )}
          {typeof discount === 'number' && discount > 0 && (
            <div className="flex justify-between items-center">
              <dt className="text-token-text/80">{tCart('discount_label')}</dt>
              <dd className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                - {fmt(discount)}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex items-baseline justify-between gap-4 rounded-lg bg-[hsl(var(--surface))]/80 border border-[hsl(var(--border))] px-4 py-3">
        <span className="text-sm font-semibold text-[hsl(var(--text))]">{t('total_to_pay')}</span>
        <p
          className="text-xl font-bold tabular-nums text-[hsl(var(--text))]"
          aria-live="polite"
          aria-label={`${tCart('total')} ${fmt(computed)}`}
        >
          {fmt(computed)}
        </p>
      </div>

      <p className="mt-4 text-[11px] text-token-text/60">{t('pay_secure')}</p>
    </section>
  );
}
