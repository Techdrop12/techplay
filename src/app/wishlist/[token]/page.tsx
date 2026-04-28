import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

import type { Product as ProductType } from '@/types/product';

import Link from '@/components/LocalizedLink';
import ProductGrid, { type Props as ProductGridProps } from '@/components/ProductGrid';
import { connectToDatabase } from '@/lib/db';
import { LIST_NAMES } from '@/lib/analytics-events';
import { toPlain } from '@/lib/utils';
import WishlistModel from '@/models/Wishlist';
import ProductModel from '@/models/Product';

export const revalidate = 60;

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  if (!token) return { title: 'Wishlist partagée — TechPlay' };
  return {
    title: 'Wishlist partagée — TechPlay',
    description: 'Découvrez cette sélection de produits TechPlay.',
    robots: { index: false, follow: false },
  };
}

export default async function SharedWishlistPage({ params }: Props) {
  const { token } = await params;
  if (!token) notFound();

  await connectToDatabase();

  const wishlist = await WishlistModel.findOne({ shareToken: token })
    .select('productIds')
    .lean()
    .exec();

  if (!wishlist) notFound();

  const ids = (wishlist.productIds ?? []).map((id: { toString(): string }) => id.toString());

  const rawProducts = ids.length > 0
    ? await ProductModel.find({ _id: { $in: ids } }).lean().exec()
    : [];

  const products = toPlain<ProductType[]>(rawProducts);

  return (
    <main className="container-app mx-auto w-full max-w-5xl pt-28 pb-20" aria-labelledby="shared-wishlist-title">
      <header className="mb-10 text-center">
        <p className="heading-kicker">Liste partagée</p>
        <h1 id="shared-wishlist-title" className="heading-page mt-2">
          Sélection TechPlay
        </h1>
        <p className="heading-section-sub mt-4">
          {products.length > 0
            ? `${products.length} produit${products.length > 1 ? 's' : ''} dans cette wishlist`
            : 'Aucun produit dans cette wishlist.'}
        </p>
      </header>

      {products.length > 0 ? (
        <ProductGrid
          products={products as ProductGridProps['products']}
          listName={LIST_NAMES.WISHLIST}
          emptyMessage=""
          showWishlistIcon
        />
      ) : (
        <div className="mx-auto max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center">
          <p className="text-token-text/70">Cette wishlist est vide.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[13px] font-semibold text-[hsl(var(--accent-fg))] transition hover:opacity-90"
          >
            Voir la boutique
          </Link>
        </div>
      )}
    </main>
  );
}
