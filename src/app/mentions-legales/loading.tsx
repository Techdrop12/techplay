export default function MentionsLegalesLoading() {
  return (
    <div className="container-app mx-auto max-w-3xl px-4 py-12">
      <div className="skeleton h-10 w-64 rounded-xl mb-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-4 w-full rounded-lg" />
        ))}
        <div className="skeleton h-4 w-full max-w-md rounded-lg" />
        {[6, 7, 8].map((i) => (
          <div key={i} className="skeleton h-4 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
