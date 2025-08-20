// src/app/produit/[slug]/loading.tsx
export default function LoadingProduct() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square rounded-3xl border border-gray-200 dark:border-gray-700 skeleton" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 skeleton" />
        <div className="h-4 w-1/2 skeleton" />
        <div className="h-6 w-1/3 skeleton" />
        <div className="h-24 w-full skeleton" />
        <div className="h-10 w-52 skeleton" />
      </div>
    </main>
  )
}
