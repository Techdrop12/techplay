export default function CategorieLoading() {
  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="h-8 w-48 animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-[hsl(var(--surface-2))]/80" />
        ))}
      </div>
    </div>
  );
}
