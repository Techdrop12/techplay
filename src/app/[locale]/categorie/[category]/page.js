// ✅ src/app/[locale]/categorie/[category]/page.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import SEOHead from '@/components/SEOHead';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }) {
  const { category, locale } = params;
  await dbConnect();
  const products = await Product.find({ category, published: true }).lean();

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? `Catégorie : ${category}` : `Category: ${category}`}
        overrideDescription={locale === 'fr'
          ? `Les meilleurs produits de la catégorie ${category}.`
          : `Top products in the ${category} category.`}
      />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 capitalize">{category}</h1>
        {products.length === 0 ? (
          <p className="text-gray-600">
            {locale === 'fr'
              ? 'Aucun produit dans cette catégorie.'
              : 'No products in this category.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
