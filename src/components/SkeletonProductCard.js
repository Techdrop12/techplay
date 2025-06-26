// ✅ src/components/SkeletonProductCard.js

export default function SkeletonProductCard() {
  return (
    <div className="animate-pulse bg-gray-100 rounded shadow p-4 h-64 flex flex-col">
      <div className="bg-gray-300 rounded h-32 w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded mb-1 w-3/4"></div>
      <div className="mt-auto h-8 bg-gray-200 rounded w-full"></div>
    </div>
  );
}
