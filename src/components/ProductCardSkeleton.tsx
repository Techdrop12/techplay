// src/components/ProductCardSkeleton.tsx
import Skeleton from '@/components/ui/Skeleton'

type Props = {
  imageHeight?: number
}

export default function ProductCardSkeleton({ imageHeight = 160 }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm space-y-4">
      <Skeleton variant="image" height={imageHeight} radiusClass="rounded-lg" />
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="rect" height={32} radiusClass="rounded-lg" className="w-1/2" />
    </div>
  )
}
