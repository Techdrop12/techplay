export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-zinc-800 p-4 rounded-lg shadow space-y-4">
      <div className="h-40 bg-gray-300 rounded" />
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-4 bg-gray-300 rounded w-1/2" />
      <div className="h-8 bg-gray-400 rounded" />
    </div>
  );
}
