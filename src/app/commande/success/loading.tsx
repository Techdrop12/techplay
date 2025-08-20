// src/app/commande/success/loading.tsx
export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-24">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-2/3 rounded bg-gray-200 dark:bg-zinc-800" />
        <div className="card p-6 space-y-4">
          <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-10 w-full rounded bg-gray-200 dark:bg-zinc-800" />
        </div>
      </div>
    </main>
  );
}
