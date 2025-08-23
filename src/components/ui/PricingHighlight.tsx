// compat PricingHighlight({ oldPrice, newPrice })
'use client'
import PricingBadge from '@/components/PricingBadge'

export default function PricingHighlight({ oldPrice, newPrice }: { oldPrice?: number; newPrice: number }) {
  return <PricingBadge amount={newPrice} original={oldPrice} />
}
