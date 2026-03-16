export default function CategoryLoading() {
  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="skeleton mb-6 h-8 w-56 rounded-lg" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
