export default function ProductSlugLoading() {
  return (
    <div className="container-app mx-auto px-4 py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded-lg" />
          <div className="skeleton h-6 w-24 rounded-lg" />
          <div className="skeleton h-24 w-full rounded-lg" />
          <div className="skeleton h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
