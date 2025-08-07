// src/app/categorie/[category]/page.tsx
import { getAllProducts } from '@/lib/data'
import ProductGrid from '@/components/ProductGrid'
import type { Metadata } from 'next'

interface Props {
  params: { category: string }
}

// ✅ SEO dynamique
export function generateMetadata({ params }: Props): Metadata {
  const capitalized = params.category.charAt(0).toUpperCase() + params.category.slice(1)
  return {
    title: `${capitalized} – Produits TechPlay`,
    description: `Explorez tous les produits de la catégorie "${capitalized}" sur TechPlay.`,
    openGraph: {
      title: `${capitalized} – Produits TechPlay`,
      description: `Tous les produits disponibles dans la catégorie "${capitalized}"`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/categorie/${params.category}`,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = params
  const allProducts = await getAllProducts()
  const products = allProducts.filter((p) => p.category === category)

  const displayCategory =
    category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')

  return (
    <main
      className="max-w-7xl mx-auto px-4 pt-32 pb-20"
      aria-labelledby="category-title"
    >
      <div className="text-center mb-12">
        <h1
          id="category-title"
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light"
        >
          {displayCategory}
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez notre sélection dans la catégorie "{displayCategory}".
        </p>
      </div>

      <ProductGrid
        products={products}
        emptyMessage={`Aucun produit trouvé dans la catégorie "${displayCategory}".`}
      />
    </main>
  )
}
