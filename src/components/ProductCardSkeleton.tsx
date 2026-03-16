// src/components/ProductCardSkeleton.tsx
import Skeleton from '@/components/ui/Skeleton';

type Props = {
  imageHeight?: number;
};

export default function ProductCardSkeleton({ imageHeight = 160 }: Props) {
  return (
    <div className="space-y-4 rounded-xl bg-[hsl(var(--surface))] p-4 shadow-[var(--shadow-sm)]">
      <Skeleton variant="image" height={imageHeight} radiusClass="rounded-lg" />
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="rect" height={32} radiusClass="rounded-lg" className="w-1/2" />
    </div>
  );
}
