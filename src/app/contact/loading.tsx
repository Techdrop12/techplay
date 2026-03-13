export default function ContactLoading() {
  return (
    <div className="container-app mx-auto max-w-2xl px-4 py-8">
      <div className="skeleton mb-8 h-10 w-48 rounded-xl" />
      <div className="space-y-6">
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-32 w-full rounded-xl" />
        <div className="skeleton h-12 w-36 rounded-xl" />
      </div>
    </div>
  )
}
