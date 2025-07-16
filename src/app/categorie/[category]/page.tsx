export default function CategoryPage({ params }: { params: { category: string } }) {
  return (
    <main className="container py-16">
      <h1 className="text-2xl font-bold mb-6">Catégorie : {params.category}</h1>
      <p className="text-muted-foreground">Produits associés à cette catégorie.</p>
    </main>
  )
}
