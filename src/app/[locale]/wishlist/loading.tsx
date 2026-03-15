export default function WishlistLoading() {
  return (
    <div className="container-app mx-auto max-w-4xl py-8" role="status" aria-live="polite" aria-label="Chargement de la liste de souhaits">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-lg bg-[hsl(var(--border))]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4">
              <div className="aspect-square rounded-lg bg-[hsl(var(--border))]" />
              <div className="mt-3 h-4 w-3/4 rounded bg-[hsl(var(--border))]" />
              <div className="mt-2 h-3 w-1/2 rounded bg-[hsl(var(--border))]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
