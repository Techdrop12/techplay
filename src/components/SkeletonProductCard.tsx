// ✅ src/components/SkeletonProductCard.js

export default function SkeletonProductCard() {
  return (
    <div className="animate-pulse bg-[hsl(var(--surface-2))] rounded-xl shadow-[var(--shadow-sm)] p-4 h-64 flex flex-col">
      <div className="bg-[hsl(var(--surface-2))]/80 rounded h-32 w-full mb-2"></div>
      <div className="h-4 bg-[hsl(var(--surface-2))]/80 rounded mb-2 w-1/2"></div>
      <div className="h-4 bg-[hsl(var(--surface-2))]/80 rounded mb-1 w-3/4"></div>
      <div className="mt-auto h-8 bg-[hsl(var(--surface-2))] rounded w-full"></div>
    </div>
  );
}
