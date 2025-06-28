// ✅ /src/app/[locale]/categorie/[category]/page.js (listing produits par catégorie)
import ProductCard from '@/components/ProductCard';
import SEOHead from '@/components/SEOHead';

export const dynamic = 'force-dynamic';

export default async function CategoriePage({ params }) {
  const { category, locale } = params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/products?category=${encodeURIComponent(category)}`,
    { cache: 'no-store' }
  );
  const products = await res.json();

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? `Catégorie : ${category}` : `Category: ${category}`}
        overrideDescription={locale === 'fr'
          ? `Découvrez les produits de la catégorie ${category} sur TechPlay.`
          : `Discover products in category ${category} on TechPlay.`}
      />
      <main className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">
          {locale === 'fr' ? `Catégorie : ${category}` : `Category: ${category}`}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.length === 0
            ? <p className="text-gray-600">Aucun produit dans cette catégorie.</p>
            : products.map((p) => <ProductCard key={p._id} product={p} />)
          }
        </div>
      </main>
    </>
  );
}
