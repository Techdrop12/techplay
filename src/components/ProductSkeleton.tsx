export default function ProductSkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-lg border p-4">
      <div className="h-40 w-full bg-muted" />
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-3 w-1/2 bg-muted rounded" />
    </div>
  )
}
