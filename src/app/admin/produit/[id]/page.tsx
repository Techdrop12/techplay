export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="container py-16">
      <h1 className="text-2xl font-bold mb-6">Modifier le produit ID : {params.id}</h1>
      <p className="text-sm text-muted-foreground">Formulaire d’édition produit à brancher.</p>
    </main>
  )
}
