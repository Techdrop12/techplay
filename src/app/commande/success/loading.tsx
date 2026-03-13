export default function SuccessLoading() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="skeleton mx-auto h-10 w-72 rounded-xl" />
      <div className="mt-4 skeleton mx-auto h-6 w-96 max-w-full rounded-lg" />
      <div className="mt-2 skeleton mx-auto h-4 w-64 rounded-lg" />
      <div className="mt-8 skeleton h-20 w-full max-w-sm mx-auto rounded-xl" />
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <div className="skeleton h-12 w-48 rounded-xl" />
        <div className="skeleton h-12 w-40 rounded-xl" />
      </div>
    </div>
  )
}
