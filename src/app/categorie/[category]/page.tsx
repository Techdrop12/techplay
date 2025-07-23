// src/app/categorie/[category]/page.tsx
interface Props {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params

  // TODO: fetch les produits de la catégorie et afficher
  // const products = await getProductsByCategory(category)

  return (
    <main className="container py-16 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-brand dark:text-brand-light">
        Catégorie : {category}
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Produits associés à cette catégorie.
      </p>

      {/* Affichage des produits ici */}
      {/* Exemple: <ProductGrid products={products} /> */}
    </main>
  )
}
