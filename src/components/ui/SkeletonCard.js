export default function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 p-4 border rounded shadow">
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
