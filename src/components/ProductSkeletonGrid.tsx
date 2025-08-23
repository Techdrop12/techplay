// src/components/ProductSkeletonGrid.tsx
import ProductCardSkeleton from '@/components/ProductCardSkeleton'

type Props = {
  count?: number
}

export default function ProductSkeletonGrid({ count = 6 }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
