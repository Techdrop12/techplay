'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import type { Product } from '@/types/product';

import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/hooks/useWishlist';
import { sendEvent } from '@/lib/analytics';
import Link from '@/components/LocalizedLink';
import BackToHomeLink from '@/components/BackToHomeLink';

type Keyable = {
  _id?: string | number;
  slug?: string | number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getProductKey(p: Keyable, i: number): string | number {
  return p._id ?? p.slug ?? i;
}

export default function WishlistClient() {
  const t = useTranslations('wishlist');
  const { data: session } = useSession();
  const [syncing, setSyncing] = useState(false);
  const isLoggedIn = Boolean(session?.user?.email);

  const wishlistState = useWishlist() as {
    items?: unknown[];
    count?: number;
    add: (item: unknown) => void;
    remove: (id: string) => void;
    clear: () => void;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- items from wishlistState, used in saveToServer/wishlist
  const items = Array.isArray(wishlistState?.items) ? wishlistState.items : [];
  const count = typeof wishlistState?.count === 'number' ? wishlistState.count : items.length;

  const saveToServer = useCallback(async () => {
    if (!isLoggedIn) return;
    setSyncing(true);
    try {
      const ids = items
        .map(
          (item) => (item as { id?: string; _id?: string })?.id ?? (item as { _id?: string })?._id
        )
        .filter(Boolean) as string[];
      const res = await fetch('/api/wishlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ids }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success(t('save_success'));
    } catch {
      toast.error(t('save_error'));
    } finally {
      setSyncing(false);
    }
  }, [isLoggedIn, items, t]);

  const loadFromServer = useCallback(async () => {
    if (!isLoggedIn || !wishlistState.clear) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/wishlist');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      const productIds: string[] = data?.productIds ?? [];
      if (productIds.length === 0) {
        wishlistState.clear();
        toast.success(t('load_empty'));
        setSyncing(false);
        return;
      }
      const productsRes = await fetch(`/api/products/by-ids?ids=${productIds.join(',')}`);
      if (!productsRes.ok) throw new Error('Erreur chargement produits');
      const products = (await productsRes.json()) as (Product & { _id: string })[];
      wishlistState.clear();
      products.forEach((p) => wishlistState.add({ ...p, id: String(p._id ?? '') }));
      toast.success(t('load_success'));
    } catch {
      toast.error(t('load_error'));
    } finally {
      setSyncing(false);
    }
  }, [isLoggedIn, wishlistState, t]);

  const wishlist = useMemo(() => {
    return items.filter(isRecord).map((item) => {
      const product = item as Partial<Product> & Keyable;

      return {
        ...product,
        title:
          typeof product.title === 'string' && product.title.trim() ? product.title : 'Product',
        image:
          typeof product.image === 'string' && product.image.trim()
            ? product.image
            : '/placeholder.png',
        price:
          typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0,
      } as Product & Keyable;
    });
  }, [items]);

  useEffect(() => {
    try {
      sendEvent?.('wishlist_view', { count });
    } catch {
      // no-op
    }
  }, [count]);

  const tCart = useTranslations('cart');

  return (
    <main
      className="container-app mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 lg:px-8"
      aria-labelledby="wishlist-title"
      role="main"
    >
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          {t('badge_favoris')}
        </p>
        <h1 id="wishlist-title" className="heading-page mt-2">
          {t('title')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-token-text/75">
          {wishlist.length === 0 ? t('empty') : t('intro_with_items')}
        </p>
      </header>

      {wishlist.length === 0 ? (
        <section
          className="overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-sm text-center"
          aria-label={t('empty_aria')}
        >
          <p className="text-[15px] text-token-text/75">{t('empty')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              {tCart('view_products')}
            </Link>
            <BackToHomeLink
              variant="outline"
              prefetch={false}
              className="!min-h-0 py-2.5 text-[15px]"
            />
          </div>
        </section>
      ) : (
        <>
          <section
            aria-label={t('title')}
            className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {wishlist.map((product, i) => (
              <ProductCard key={getProductKey(product, i)} product={product} />
            ))}
          </section>
          <p className="mt-6 text-center text-[13px] text-token-text/60">{t('saved_on_device')}</p>
          {isLoggedIn && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={saveToServer}
                disabled={syncing}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-[hsl(var(--text))] hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60"
              >
                {syncing ? t('syncing_btn') : t('save_account_btn')}
              </button>
              <button
                type="button"
                onClick={loadFromServer}
                disabled={syncing}
                className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-[hsl(var(--accent-fg))] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60"
              >
                {t('load_from_account')}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
