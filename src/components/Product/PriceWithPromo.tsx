// compat PriceWithPromo({ price, promo })
'use client'
import Price from '@/components/Price'

export default function PriceWithPromo({ price, promo = 0 }: { price: number; promo?: number }) {
  const discounted = Math.max(0, price - (price * promo) / 100)
  return <Price amount={discounted} original={promo > 0 ? price : undefined} />
}
