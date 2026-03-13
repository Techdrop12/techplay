export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="container py-16">
      <h1 className="text-2xl font-bold mb-6">Modifier le produit ID : {id}</h1>
      <p className="text-sm text-muted-foreground">Formulaire d’édition produit à brancher.</p>
    </main>
  )
}
