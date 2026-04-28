'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/LocalizedLink';
import { useCompare } from '@/hooks/useCompare';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';

type ProductRecord = Product & Record<string, unknown>;

const SPEC_KEYS: { key: string; label: string }[] = [
  { key: 'brand', label: 'Marque' },
  { key: 'category', label: 'Catégorie' },
  { key: 'rating', label: 'Note' },
  { key: 'reviewsCount', label: 'Avis' },
  { key: 'stock', label: 'Stock' },
  { key: 'sku', label: 'SKU' },
];

function Cell({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-token-text/40">—</span>;
  }
  return <span>{String(value)}</span>;
}

export default function ComparePage() {
  const { items, remove, clear } = useCompare();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="container-app mx-auto max-w-3xl pt-28 pb-20 text-center" aria-labelledby="compare-title">
        <h1 id="compare-title" className="heading-page">Comparateur</h1>
        <p className="heading-section-sub mt-4">Vous n'avez pas encore ajouté de produits à comparer.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-[14px] font-semibold text-[hsl(var(--accent-fg))] transition hover:opacity-90"
        >
          Voir la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="container-app mx-auto max-w-5xl pt-28 pb-20" aria-labelledby="compare-title">
      <div className="mb-8 flex items-center justify-between">
        <h1 id="compare-title" className="heading-section">
          Comparateur <span className="text-token-text/50 text-lg font-normal">({items.length}/3)</span>
        </h1>
        <button
          onClick={clear}
          className="rounded-full border border-[hsl(var(--border))] px-4 py-2 text-[13px] font-medium transition hover:bg-[hsl(var(--surface-2))]"
          aria-label="Vider le comparateur"
        >
          Tout supprimer
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
        <table className="w-full min-w-[500px] table-fixed border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="w-36 py-4 px-4 text-left text-[12px] font-semibold uppercase tracking-widest text-token-text/50">
                Critère
              </th>
              {items.map((p) => {
                const pr = p as ProductRecord;
                const id = String(pr._id ?? pr.id ?? pr.slug ?? '');
                const image = typeof pr.image === 'string' ? pr.image : '/og-image.jpg';
                return (
                  <th key={id} className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
                        <Image src={image} alt={p.title ?? ''} fill className="object-cover" sizes="80px" />
                      </div>
                      <Link
                        href={`/products/${p.slug}`}
                        className="line-clamp-2 text-[13px] font-semibold leading-snug hover:text-[hsl(var(--accent))]"
                      >
                        {p.title}
                      </Link>
                      <button
                        onClick={() => remove(id)}
                        className="text-[11px] text-token-text/50 hover:text-red-500"
                        aria-label={`Retirer ${p.title} du comparateur`}
                      >
                        Retirer
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Prix */}
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <td className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wide text-token-text/60">Prix</td>
              {items.map((p) => {
                const pr = p as ProductRecord;
                const id = String(pr._id ?? pr.id ?? pr.slug ?? '');
                return (
                  <td key={id} className="py-3 px-4 text-center font-bold text-[hsl(var(--accent))]">
                    {typeof p.price === 'number' ? formatPrice(p.price) : '—'}
                  </td>
                );
              })}
            </tr>

            {/* Specs */}
            {SPEC_KEYS.map(({ key, label }, rowIdx) => (
              <tr
                key={key}
                className={[
                  'border-b border-[hsl(var(--border))]',
                  rowIdx % 2 === 0 ? '' : 'bg-[hsl(var(--surface))]',
                ].join(' ')}
              >
                <td className="py-3 px-4 text-[12px] font-semibold uppercase tracking-wide text-token-text/60">
                  {label}
                </td>
                {items.map((p) => {
                  const pr = p as ProductRecord;
                  const id = String(pr._id ?? pr.id ?? pr.slug ?? '');
                  return (
                    <td key={id} className="py-3 px-4 text-center text-token-text/80">
                      <Cell value={pr[key]} />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* CTA */}
            <tr>
              <td className="py-4 px-4" />
              {items.map((p) => {
                const pr = p as ProductRecord;
                const id = String(pr._id ?? pr.id ?? pr.slug ?? '');
                return (
                  <td key={id} className="py-4 px-4 text-center">
                    <Link
                      href={`/products/${p.slug}`}
                      className="inline-flex items-center rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[13px] font-semibold text-[hsl(var(--accent-fg))] transition hover:opacity-90"
                    >
                      Voir le produit
                    </Link>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
