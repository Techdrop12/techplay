export default function BlogSlugLoading() {
  return (
    <article className="container-app mx-auto max-w-3xl px-4 py-8">
      <div className="skeleton mb-4 h-10 w-full rounded-lg" />
      <div className="skeleton mb-6 h-4 w-48 rounded-lg" />
      <div className="skeleton mb-8 aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-4 w-full rounded" />
        ))}
      </div>
    </article>
  )
}
