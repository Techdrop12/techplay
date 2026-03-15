export default function ContactLoading() {
  return (
    <div className="container-app mx-auto w-full max-w-3xl pt-24 pb-20 overflow-x-hidden">
      <header className="mb-10 text-center sm:mb-12">
        <div className="skeleton mx-auto h-4 w-32 rounded-lg" />
        <div className="skeleton mx-auto mt-3 h-10 w-64 max-w-full rounded-xl" />
        <div className="skeleton mx-auto mt-4 h-5 w-80 max-w-full rounded-lg" />
      </header>
      <div className="space-y-6">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
          <div className="skeleton h-6 w-48 rounded-lg" />
          <div className="skeleton mt-2 h-4 w-full rounded" />
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="skeleton h-12 w-36 rounded-xl" />
            <div className="skeleton h-12 w-32 rounded-xl" />
            <div className="skeleton h-12 w-40 rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-11 w-full rounded-xl" />
            <div className="skeleton h-11 w-full rounded-xl" />
            <div className="skeleton h-28 w-full rounded-xl" />
            <div className="skeleton h-6 w-24 rounded-lg" />
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
          <div className="skeleton h-5 w-36 rounded-lg" />
          <div className="skeleton mt-3 h-10 w-56 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="skeleton h-28 rounded-2xl" />
          <div className="skeleton h-28 rounded-2xl" />
          <div className="skeleton h-28 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
