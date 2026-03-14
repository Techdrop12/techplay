export default function CartLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 h-9 w-52 animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-4 lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[1.25rem] bg-[hsl(var(--surface))]/80 dark:bg-[hsl(var(--surface))]/60"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-[hsl(var(--surface-2))]" />
      </div>
    </div>
  )
}
