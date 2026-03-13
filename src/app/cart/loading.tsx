export default function CartLoading() {
  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="skeleton mb-6 h-8 w-48 rounded-xl" />
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-48 w-full rounded-2xl sm:w-80" />
      </div>
    </div>
  )
}
