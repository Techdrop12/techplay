export default function LoginLoading() {
  return (
    <main className="mx-auto max-w-sm px-4 py-10" role="main" aria-busy="true">
      <div className="rounded-[1.5rem] border border-white/10 bg-[hsl(var(--surface))]/95 p-6 dark:bg-[hsl(var(--surface))]/90 sm:p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[hsl(var(--surface-2))]" />
        <div className="space-y-4">
          <div className="h-11 w-full animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
          <div className="h-11 w-full animate-pulse rounded-full bg-[hsl(var(--surface-2))]" />
        </div>
      </div>
    </main>
  )
}
