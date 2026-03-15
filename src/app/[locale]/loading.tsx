export default function LocaleLoading() {
  return (
    <main className="container-app mx-auto max-w-5xl px-4 py-12" role="main" aria-busy="true">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-[hsl(var(--surface-2))]/80" />
        ))}
      </div>
    </main>
  )
}
