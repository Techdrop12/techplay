export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded" />
      <div className="h-6 bg-gray-200 rounded w-5/6" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
    </div>
  )
}
