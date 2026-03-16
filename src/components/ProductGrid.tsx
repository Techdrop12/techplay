'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { Product } from '@/types/product';

import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { BRAND } from '@/lib/constants';
import { trackViewItemList } from '@/lib/ga';
import { cn } from '@/lib/utils';

type Cols = {
  base?: 1 | 2;
  sm?: 1 | 2 | 3;
  md?: 1 | 2 | 3 | 4;
  lg?: 1 | 2 | 3 | 4 | 5;
  xl?: 1 | 2 | 3 | 4 | 5 | 6;
};

export interface Props {
  products: Product[];
  emptyMessage?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  observeMore?: boolean;
  loadingCount?: number;
  showWishlistIcon?: boolean;
  columns?: Cols;
  className?: string;
  listName?: string;
  id?: string;
}

const GRID_COLS = {
  base: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
  },
} as const;

function getGridClasses(cols?: Cols): string {
  const safe = {
    base: cols?.base ?? 1,
    sm: cols?.sm ?? 2,
    md: cols?.md ?? 2,
    lg: cols?.lg ?? 3,
    xl: cols?.xl ?? 4,
  };

  return [
    GRID_COLS.base[safe.base],
    GRID_COLS.sm[safe.sm],
    GRID_COLS.md[safe.md],
    GRID_COLS.lg[safe.lg],
    GRID_COLS.xl[safe.xl],
  ]
    .filter(Boolean)
    .join(' ');
}

function getProductKey(product: Product, index: number): string {
  if (typeof product._id === 'string' && product._id.trim()) return product._id;
  if (typeof product.slug === 'string' && product.slug.trim()) return product.slug;
  return `product-${index}`;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    title: product.title?.trim() || 'Produit',
    image:
      product.image ||
      (Array.isArray(product.images)
        ? product.images.find((img) => typeof img === 'string' && img.trim())
        : undefined) ||
      (Array.isArray(product.gallery)
        ? product.gallery.find((img) => typeof img === 'string' && img.trim())
        : undefined) ||
      '/og-image.jpg',
  };
}

export default function ProductGrid({
  products,
  emptyMessage,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  observeMore = true,
  loadingCount = 8,
  showWishlistIcon: _showWishlistIcon = false,
  columns,
  className = '',
  listName = 'product_grid',
  id,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const loadingGateRef = useRef(false);
  const prevLenRef = useRef(0);
  const seenRef = useRef<Set<string>>(new Set());
  const batchRef = useRef<{ id: string; name: string; price?: number }[]>([]);
  const flushTimeoutRef = useRef<number | null>(null);

  const safeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter(Boolean).map(normalizeProduct) : []),
    [products]
  );

  const isEmpty = safeProducts.length === 0;
  const t = useTranslations('product_list');

  const countMsg = useMemo(() => {
    if (isLoading && isEmpty) return t('loading_products');
    if (isEmpty) return emptyMessage || t('no_products');
    return t('displayed_count', { count: safeProducts.length });
  }, [emptyMessage, isEmpty, isLoading, safeProducts.length, t]);

  const flushBatch = useCallback(() => {
    if (!batchRef.current.length) return;

    try {
      trackViewItemList({
        item_list_name: listName,
        items: batchRef.current.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
        })),
      });
    } catch {
      // no-op
    }

    batchRef.current = [];

    if (flushTimeoutRef.current) {
      window.clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
  }, [listName]);

  useEffect(() => {
    if (!observeMore || !hasMore || !onLoadMore || !sentinelRef.current) return;

    const el = sentinelRef.current;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (!hit || loadingGateRef.current) return;

        loadingGateRef.current = true;

        try {
          onLoadMore();
        } finally {
          window.setTimeout(() => {
            loadingGateRef.current = false;
          }, 500);
        }
      },
      { rootMargin: '220px 0px 420px 0px', threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, observeMore, onLoadMore]);

  useEffect(() => {
    if (!isLoading) loadingGateRef.current = false;
  }, [isLoading]);

  useEffect(() => {
    const prev = prevLenRef.current;
    const curr = safeProducts.length;

    if (curr > prev && prev > 0 && statusRef.current) {
      const diff = curr - prev;
      statusRef.current.textContent = `${diff} produit${diff > 1 ? 's' : ''} ajouté${diff > 1 ? 's' : ''}.`;
    } else if (prev === 0 && curr > 0 && statusRef.current) {
      statusRef.current.textContent = countMsg;
    }

    prevLenRef.current = curr;
  }, [countMsg, safeProducts.length]);

  useEffect(() => {
    seenRef.current.clear();
    batchRef.current = [];

    if (!gridRef.current || safeProducts.length === 0) return;

    const nodes = Array.from(gridRef.current.querySelectorAll<HTMLElement>('[data-product-id]'));
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const productId = entry.target.getAttribute('data-product-id') || '';
          const name =
            entry.target
              .getAttribute('aria-label')
              ?.replace(/^Produit\s:\s/i, '')
              .replace(/^Product:\s/i, '') || '';

          if (!productId || seenRef.current.has(productId)) continue;

          seenRef.current.add(productId);

          const product = safeProducts.find(
            (p) => String(p._id) === productId || String(p.slug) === productId
          );

          batchRef.current.push({
            id: productId,
            name: name || product?.title || 'Produit',
            price: typeof product?.price === 'number' ? product.price : undefined,
          });
        }

        if (!flushTimeoutRef.current && batchRef.current.length) {
          flushTimeoutRef.current = window.setTimeout(flushBatch, 250);
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px 120px 0px' }
    );

    nodes.forEach((node) => io.observe(node));

    return () => {
      io.disconnect();
      flushBatch();
    };
  }, [flushBatch, safeProducts]);

  const itemListJsonLd = useMemo(() => {
    if (!safeProducts.length) return null;

    const base = BRAND.URL;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: safeProducts.slice(0, 12).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: product.slug ? `${base}/products/${product.slug}` : `${base}/products`,
        name: product.title || 'Produit',
      })),
    };
  }, [safeProducts]);

  if (isEmpty && !isLoading) {
    return (
      <div
        className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/70 card-padding text-center"
        role="status"
      >
        <p className="text-base font-semibold text-token-text">
          {emptyMessage || t('no_products')}
        </p>
      </div>
    );
  }

  return (
    <>
      <p ref={statusRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {countMsg}
      </p>

      <AnimatePresence mode={prefersReducedMotion ? 'sync' : 'popLayout'}>
        <motion.div
          key="grid"
          ref={gridRef}
          layout={!prefersReducedMotion}
          className={cn('grid gap-5 sm:gap-6 lg:gap-8', getGridClasses(columns), className)}
          aria-live="polite"
          aria-busy={isLoading ? 'true' : 'false'}
          role="list"
          id={id}
        >
          {safeProducts.map((product, index) => (
            <motion.div
              key={getProductKey(product, index)}
              layout={!prefersReducedMotion}
              role="listitem"
            >
              <ProductCard product={product} priority={index < 2} />
            </motion.div>
          ))}

          {isLoading
            ? Array.from({ length: loadingCount }).map((_, index) => (
                <div key={`skeleton-${index}`} aria-hidden="true">
                  <ProductSkeleton />
                </div>
              ))
            : null}
        </motion.div>
      </AnimatePresence>

      {(hasMore || isLoading) && onLoadMore ? (
        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-xl bg-[hsl(var(--accent))] px-5 py-2.5 font-semibold text-white shadow transition hover:shadow-lg hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.35)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={t('load_more_aria')}
            data-gtm="grid_load_more"
          >
            {isLoading ? t('loading_products') : t('load_more')}
          </button>
        </div>
      ) : null}

      {observeMore && hasMore ? <div ref={sentinelRef} className="h-1" aria-hidden="true" /> : null}

      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
    </>
  );
}
