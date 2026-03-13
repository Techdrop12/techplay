export default function BlogLoading() {
  return (
    <div className="container-app mx-auto max-w-4xl px-4 py-12">
      <div className="skeleton mb-8 h-10 w-40 rounded-xl" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
