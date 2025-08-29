// src/components/checkout/OrderSummary.tsx — FINAL+ (locale/currency-friendly)
import { cn, formatPrice } from '@/lib/utils'

type Props = {
  subtotal?: number
  shipping?: number
  tax?: number
  discount?: number
  /** total (si fourni, affichage direct). Sinon: subtotal + shipping + tax - discount */
  total?: number
  currency?: string
  locale?: string
  className?: string
}

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
  const computed =
    typeof total === 'number'
      ? total
      : Math.max(0, (subtotal ?? 0) + (shipping ?? 0) + (tax ?? 0) - (discount ?? 0))

  const showBreakdown =
    typeof subtotal === 'number' ||
    typeof shipping === 'number' ||
    typeof tax === 'number' ||
    typeof discount === 'number'

  const fmt = (v: number) => formatPrice(v, { currency, locale })

  return (
    <div className={cn('border-t pt-4 mt-4', className)} role="region" aria-label="Récapitulatif commande">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Récapitulatif</h3>

      {showBreakdown && (
        <dl className="space-y-1 text-sm">
          {typeof subtotal === 'number' && (
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Sous-total</dt>
              <dd className="font-medium">{fmt(subtotal)}</dd>
            </div>
          )}
          {typeof shipping === 'number' && (
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Livraison</dt>
              <dd className="font-medium">{fmt(shipping)}</dd>
            </div>
          )}
          {typeof tax === 'number' && (
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">TVA</dt>
              <dd className="font-medium">{fmt(tax)}</dd>
            </div>
          )}
          {typeof discount === 'number' && discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Remise</dt>
              <dd className="font-medium">- {fmt(discount)}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex items-baseline justify-between mt-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</h4>
        <p className="text-xl font-bold text-brand" aria-live="polite" aria-label={`Total ${fmt(computed)}`}>
          {fmt(computed)}
        </p>
      </div>
    </div>
  )
}
