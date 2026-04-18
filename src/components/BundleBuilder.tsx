'use client';

import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

import type { Product } from '@/types/product';

import { useCart } from '@/hooks/useCart';
import { cn, formatPrice, storefrontPriceOpts } from '@/lib/utils';

type BundleCategory = 'mouse' | 'keyboard' | 'accessory';

const CATEGORY_MAP: Record<BundleCategory, RegExp> = {
  mouse: /souris|mouse|gaming mouse|wireless mouse/i,
  keyboard: /clavier|keyboard/i,
  accessory: /batterie|battery|power bank|chargeur|charger|hub|support|stand|accessoire/i,
};

const BUNDLE_DISCOUNT_RATE = 0.1;

interface BundleBuilderProps {
  products: Product[];
}

export default function BundleBuilder({ products }: BundleBuilderProps) {
  const routeLocale = useLocale();
  const priceFmt = useMemo(() => storefrontPriceOpts(routeLocale), [routeLocale]);
  const { addToCart } = useCart();

  const [selected, setSelected] = useState<Partial<Record<BundleCategory, Product>>>({});

  const byCategory = useMemo(() => {
    const result: Record<BundleCategory, Product[]> = {
      mouse: [],
      keyboard: [],
      accessory: [],
    };

    for (const product of products) {
      const label = `${product.category || ''} ${product.title || ''}`.toLowerCase();

      for (const key of Object.keys(CATEGORY_MAP) as BundleCategory[]) {
        if (CATEGORY_MAP[key].test(label)) {
          result[key].push(product);
          break;
        }
      }
    }

    // Curate a small, premium-feeling subset per category (max 5)
    (Object.keys(result) as BundleCategory[]).forEach((key) => {
      const list = result[key];
      result[key] = [...list]
        .sort((a, b) => {
          // Best-sellers and new products first, then by price descending
          const aScore = (a.isBestSeller ? 2 : 0) + (a.isNew ? 1 : 0);
          const bScore = (b.isBestSeller ? 2 : 0) + (b.isNew ? 1 : 0);
          if (aScore !== bScore) return bScore - aScore;
          return (b.price ?? 0) - (a.price ?? 0);
        })
        .slice(0, 5);
    });

    return result;
  }, [products]);

  const subtotal = useMemo(
    () =>
      (['mouse', 'keyboard', 'accessory'] as BundleCategory[]).reduce(
        (sum, key) => sum + (selected[key]?.price ?? 0),
        0
      ),
    [selected]
  );

  const discount = subtotal > 0 ? Math.round(subtotal * BUNDLE_DISCOUNT_RATE) : 0;
  const total = Math.max(0, subtotal - discount);

  const isComplete = ['mouse', 'keyboard', 'accessory'].every(
    (key) => selected[key as BundleCategory]
  );

  const handleAddBundle = () => {
    if (!isComplete) return;

    (['mouse', 'keyboard', 'accessory'] as BundleCategory[]).forEach((key) => {
      const product = selected[key];
      if (!product) return;

      addToCart({
        _id: product._id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
        category: product.category,
      });
    });
  };

  const renderColumn = (category: BundleCategory, title: string, description: string) => {
    const items = byCategory[category];
    const current = selected[category];

    return (
      <section
        className="space-y-3 rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/70 p-4 md:p-5"
        aria-label={title}
      >
        <header className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-[hsl(var(--text))]">
              {title}
            </p>
            <p className="mt-1 text-[11px] text-token-text/70">{description}</p>
          </div>
          {current ? (
            <button
              type="button"
              onClick={() =>
                setSelected((prev) => ({
                  ...prev,
                  [category]: undefined,
                }))
              }
              className="text-[11px] font-medium text-token-text/60 underline-offset-2 hover:text-[hsl(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded"
            >
              Retirer
            </button>
          ) : null}
        </header>

        {current ? (
          <div className="rounded-xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/90 p-3">
            <p className="text-[12px] font-semibold text-[hsl(var(--text))] line-clamp-2">
              {current.title}
            </p>
            <p className="mt-1 text-[11px] text-token-text/70">{formatPrice(current.price, priceFmt)}</p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-[hsl(var(--border))]/70 bg-[hsl(var(--surface-2))]/50 px-3 py-2 text-[11px] text-token-text/70">
            Choisis un produit ci-dessous pour cette catégorie.
          </p>
        )}

        <div className="mt-2 grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1">
          {items.map((product) => {
            const active = current?._id === product._id;
            return (
              <button
                key={product._id}
                type="button"
                onClick={() =>
                  setSelected((prev) => ({
                    ...prev,
                    [category]: product,
                  }))
                }
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[12px] transition',
                  active
                    ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)]'
                    : 'border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/80 hover:border-[hsl(var(--accent)/0.6)] hover:bg-[hsl(var(--surface-2))]/90'
                )}
              >
                <span className="line-clamp-2 flex-1 text-[hsl(var(--text))]">{product.title}</span>
                <span className="shrink-0 text-[11px] font-semibold text-token-text/80">
                  {formatPrice(product.price, priceFmt)}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <section className="space-y-6 rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/70 p-5 shadow-[var(--shadow-md)] sm:p-6">
      <header className="space-y-2 text-left sm:text-left">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
          Build your perfect setup
        </p>
        <h2 className="text-lg font-bold leading-snug text-[hsl(var(--text))] sm:text-xl">
          Compose ton propre bundle
        </h2>
        <p className="text-[13px] text-token-text/75">
          Crée ton setup sur mesure en combinant souris, clavier et accessoire, et{' '}
          <span className="font-semibold text-[hsl(var(--accent))]">
            économise automatiquement {Math.round(BUNDLE_DISCOUNT_RATE * 100)}%
          </span>{' '}
          grâce aux bundles.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderColumn('mouse', 'Souris', 'Ton contrôle principal pour le jeu ou le travail.')}
        {renderColumn('keyboard', 'Clavier', 'Ton clavier principal, mécanique ou bureautique.')}
        {renderColumn('accessory', 'Accessoire', 'Complète ton setup avec un accessoire malin.')}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface-2))]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-[13px] text-token-text/80">
          <p className="font-semibold text-[hsl(var(--text))]">Récapitulatif du bundle</p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="text-[12px] text-token-text/65">Sous-total produits</span>
            <span className="text-[13px] font-semibold text-[hsl(var(--text))]">
              {formatPrice(subtotal || 0, priceFmt)}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="text-[12px] text-token-text/65">Remise bundle</span>
            <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
              −{formatPrice(discount || 0, priceFmt)} ({Math.round(BUNDLE_DISCOUNT_RATE * 100)}%)
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="text-[12px] text-token-text/65">Total bundle</span>
            <span className="text-[16px] font-bold text-[hsl(var(--text))]">
              {formatPrice(total || 0, priceFmt)}
            </span>
            {discount > 0 && (
              <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                Vous économisez {formatPrice(discount || 0, priceFmt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:w-auto sm:min-w-[220px]">
          <button
            type="button"
            onClick={handleAddBundle}
            disabled={!isComplete || total <= 0}
            className={cn(
              'btn-premium w-full justify-center rounded-xl text-[14px] font-bold',
              'min-h-[3rem] px-4 py-2.5',
              (!isComplete || total <= 0) && 'cursor-not-allowed opacity-60'
            )}
          >
            Ajouter le bundle au panier
          </button>
          <p className="text-center text-[11px] text-token-text/60">
            Paiement sécurisé, livraison rapide et SAV réactif inclus.
          </p>
        </div>
      </div>
    </section>
  );
}

