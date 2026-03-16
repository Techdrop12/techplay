export default function ProductSlugLoading() {
  return (
    <div className="container-app mx-auto py-10 sm:py-12">
      <div className="loading-stagger grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="skeleton aspect-square rounded-[var(--radius-2xl)]" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded-[var(--radius-lg)]" />
          <div className="skeleton h-6 w-24 rounded-[var(--radius-lg)]" />
          <div className="skeleton h-24 w-full rounded-[var(--radius-lg)]" />
          <div className="skeleton h-12 w-32 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    </div>
  );
}
