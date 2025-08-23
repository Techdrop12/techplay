// compat ancien PriceTag({ price })
'use client'
import Price from '@/components/Price'

export default function PriceTag({ price }: { price: number }) {
  return <Price amount={price} />
}
