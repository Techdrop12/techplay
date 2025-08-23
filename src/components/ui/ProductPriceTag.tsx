// compat ProductPriceTag({ price })
'use client'
import Price from '@/components/Price'

export default function ProductPriceTag({ price }: { price: number }) {
  return <Price amount={price} className="text-blue-600 dark:text-blue-400" />
}
