export default function SuccessLoading() {
  return (
    <main
      className="container-app flex min-h-[50vh] flex-col items-center justify-center py-16"
      role="main"
      aria-busy="true"
    >
      <div className="h-10 w-48 animate-pulse rounded-xl bg-[hsl(var(--surface-2))]" />
      <div className="mt-6 h-4 w-64 animate-pulse rounded bg-[hsl(var(--surface-2))]/80" />
    </main>
  );
}
