export default function ProductLoader() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[hsl(var(--surface))] rounded-xl p-4 shadow-[var(--shadow-sm)]">
          <div className="h-32 bg-[hsl(var(--surface-2))] mb-4 rounded" />
          <div className="h-4 bg-[hsl(var(--surface-2))] w-3/4 mb-2 rounded" />
          <div className="h-4 bg-[hsl(var(--surface-2))] w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
