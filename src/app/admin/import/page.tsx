export default function AdminImportPage() {
  return (
    <main className="container py-16" role="main" aria-labelledby="admin-import-title">
      <div className="rounded-[1.5rem] border border-white/10 bg-[hsl(var(--surface))]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:bg-[hsl(var(--surface))]/90 sm:p-8">
        <h1 id="admin-import-title" className="mb-6 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Importer produits
        </h1>
        <p className="mb-4 text-[15px] text-gray-600 dark:text-gray-400">
          Importer des produits depuis une URL ou un JSON local.
        </p>
        {/* Champ formulaire + preview produits à ajouter */}
      </div>
    </main>
  )
}
