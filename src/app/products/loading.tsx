export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] animate-pulse rounded-[1.75rem] bg-[hsl(var(--surface))]/80 dark:bg-[hsl(var(--surface))]/60"
          />
        ))}
      </div>
    </div>
  )
}
