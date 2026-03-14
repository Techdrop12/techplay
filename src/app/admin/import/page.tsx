export default function AdminImportPage() {
  return (
    <main className="container py-16" role="main" aria-labelledby="admin-import-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-md)] sm:p-8">
        <h1 id="admin-import-title" className="heading-page mb-6">
          Importer produits
        </h1>
        <p className="mb-4 text-[15px] text-token-text/70">
          Importer des produits depuis une URL ou un JSON local.
        </p>
        {/* Champ formulaire + preview produits à ajouter */}
      </div>
    </main>
  )
}
