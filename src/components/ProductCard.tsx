'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { memo, useMemo, useState } from 'react';

import type { Product } from '@/types/product';

import AddToCartButton from '@/components/AddToCartButton';
import FreeShippingBadge from '@/components/FreeShippingBadge';
import Link from '@/components/LocalizedLink';
import RatingStars from '@/components/RatingStars';
import WishlistButton from '@/components/WishlistButton';
import { pushDataLayer } from '@/lib/ga';
import { logEvent } from '@/lib/logEvent';
import { getProductImage, getProductSecondImage } from '@/lib/productImage';
import { cn, formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+';

function getTitle(product: Product): string {
  return product.title?.trim() || 'Produit';
}

function getDescription(product: Product): string | undefined {
  return typeof product.description === 'string' && product.description.trim()
    ? product.description.trim()
    : undefined;
}

function getOldPrice(product: Product): number | undefined {
  return typeof product.oldPrice === 'number' && product.oldPrice > product.price
    ? product.oldPrice
    : undefined;
}

function getRatingValue(product: Product): number {
  if (product.aggregateRating && typeof product.aggregateRating.average === 'number') {
    return Math.max(0, Math.min(5, product.aggregateRating.average));
  }

  if (typeof product.rating === 'number') {
    return Math.max(0, Math.min(5, product.rating));
  }

  return 0;
}

function getReviewsCount(product: Product): number {
  if (product.aggregateRating && typeof product.aggregateRating.total === 'number') {
    return Math.max(0, product.aggregateRating.total);
  }

  if (typeof product.reviewsCount === 'number') {
    return Math.max(0, product.reviewsCount);
  }

  if (Array.isArray(product.reviews)) {
    return product.reviews.length;
  }

  return 0;
}

function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const t = useTranslations('product_card');

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const title = useMemo(() => getTitle(product), [product]);
  const _description = useMemo(() => getDescription(product), [product]);
  const image = useMemo(
    () => (imgError ? '/og-image.jpg' : getProductImage(product)),
    [product, imgError]
  );
  const secondImage = useMemo(() => getProductSecondImage(product), [product]);
  const oldPrice = useMemo(() => getOldPrice(product), [product]);
  const ratingValue = useMemo(() => getRatingValue(product), [product]);
  const reviewsCount = useMemo(() => getReviewsCount(product), [product]);

  const href = product.slug ? `/products/${product.slug}` : '/products';
  const productId = String(product._id || product.slug || '');
  const hasDiscount = typeof oldPrice === 'number' && oldPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((oldPrice - product.price) / oldPrice) * 100)
    : null;

  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const lowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 5;

  const handleClick = () => {
    try {
      logEvent({
        action: 'product_card_click',
        category: 'engagement',
        label: product.slug || product._id,
        value: product.price,
      });
    } catch {
      // no-op
    }

    try {
      pushDataLayer({
        event: 'select_item',
        item_list_name: 'product_grid',
        items: [
          {
            item_id: product._id,
            item_name: title,
            price: product.price,
            item_category: product.category,
            item_brand: product.brand,
          },
        ],
      });
    } catch {
      // no-op
    }
  };

  return (
    <motion.article
      itemScope
      itemType="https://schema.org/Product"
      aria-label={t('product_aria', { title })}
      data-product-id={productId || product.slug}
      className={cn(
        'group relative flex w-full min-w-0 max-w-full flex-col rounded-2xl p-[1px]',
        'bg-gradient-to-b from-white/70 via-white/12 to-white/0 dark:from-white/18 dark:via-white/6 dark:to-transparent',
        'shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.22)]',
        'transition-[box-shadow,transform,border-color] duration-300 ease-[var(--ease-smooth)]',
        !prefersReducedMotion && [
          'hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.38)]',
          'hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.2),0_20px_48px_rgba(15,23,42,0.12)]',
          'dark:hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.3),0_20px_48px_rgba(0,0,0,0.38)]',
        ],
        className
      )}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={image} />
      {product.brand ? <meta itemProp="brand" content={product.brand} /> : null}
      {product.sku ? <meta itemProp="sku" content={product.sku} /> : null}

      <div
        className={cn(
          'relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-2xl)]',
          'border border-[hsl(var(--border))]/80 dark:border-white/10',
          'bg-[hsl(var(--surface))]/98 dark:bg-[hsl(var(--surface))]/92 supports-[backdrop-filter]:backdrop-blur-2xl',
          'transition-[box-shadow,border-color] duration-300 ease-[var(--ease-smooth)]',
          'group-hover:border-[hsl(var(--accent)/0.4)] dark:group-hover:border-[hsl(var(--accent)/0.5)]'
        )}
      >
        <WishlistButton
          product={{
            _id: product._id,
            slug: product.slug,
            title,
            price: product.price,
            image,
          }}
          floating
          className="left-3 top-3 right-auto z-20"
        />

        <Link
          href={href}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80"
          onClick={handleClick}
        >
          {/* Cadre image — ratio fixe, tout le contenu s’adapte à l’intérieur */}
          <div className="card-shine relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-t-[var(--radius-lg)] bg-[hsl(var(--surface-2))] sm:aspect-[1/1]">
            <div className="absolute inset-0 overflow-hidden rounded-t-[var(--radius-lg)]">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(min-width:1280px) 22vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                className={cn(
                  'rounded-t-[14px] object-cover object-center transition-[transform,opacity] duration-300 ease-[var(--ease-smooth)]',
                  imgLoaded ? 'opacity-100' : 'opacity-0',
                  !prefersReducedMotion && 'group-hover:scale-105',
                  secondImage && 'duration-400 group-hover:opacity-0'
                )}
                priority={priority}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                quality={88}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                draggable={false}
              />
              {secondImage ? (
                <Image
                  src={secondImage}
                  alt=""
                  fill
                  sizes="(min-width:1280px) 22vw, (min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                  className={cn(
                    'absolute inset-0 rounded-t-[14px] object-cover object-center opacity-0 transition-[opacity,transform] duration-400 ease-[var(--ease-smooth)] group-hover:opacity-100',
                    !prefersReducedMotion && 'group-hover:scale-105'
                  )}
                  aria-hidden
                  draggable={false}
                />
              ) : null}

              {!imgLoaded && (
                <div
                  className="absolute inset-0 animate-pulse bg-gradient-to-br from-[hsl(var(--surface-2))] to-[hsl(var(--surface))]"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Badges: En stock, Promo, Livraison offerte — sous le cœur wishlist */}
            <div className="pointer-events-none absolute left-3 top-12 z-10 flex flex-col gap-2 sm:left-4 sm:top-14">
              {product.isNew ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-950 shadow-md ring-1 ring-emerald-900/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/90" />
                  {t('new')}
                </span>
              ) : null}

              {product.isBestSeller ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-950 shadow-md ring-1 ring-amber-900/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t('best_seller')}
                </span>
              ) : null}

              {discountPct ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-red-50 shadow-md ring-1 ring-red-900/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
                  {t('sale')} -{discountPct}%
                </span>
              ) : null}

              {lowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-200/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-950 shadow-md ring-1 ring-amber-800/30 dark:bg-amber-400/90 dark:text-amber-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t('low_stock')}
                </span>
              ) : null}
            </div>

            {/* Rating overlay when available */}
            {ratingValue > 0 || reviewsCount > 0 ? (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-[11px] shadow-lg backdrop-blur-xl sm:right-4 sm:top-4">
                <RatingStars
                  value={ratingValue}
                  size="xs"
                  editable={false}
                  filledClassName="text-amber-400"
                  emptyClassName="text-white/40"
                />
                <span className="font-semibold tabular-nums text-white">
                  {ratingValue > 0 ? ratingValue.toFixed(1) : '—'}
                </span>
                {reviewsCount > 0 ? <span className="text-white/80">({reviewsCount})</span> : null}
              </div>
            ) : null}

            {outOfStock ? (
              <div className="absolute inset-0 grid place-items-center bg-black/55 text-xs font-semibold uppercase tracking-wider text-white/90">
                {t('out_of_stock')}
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Bloc contenu — tout s’adapte au cadre, pas de débordement */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5">
            {/* 1. Identité produit */}
            <div className="min-w-0 shrink-0">
              <h3
                className="line-clamp-2 break-words text-[15px] font-bold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-base"
                title={title}
              >
                {title}
              </h3>
              {product.brand || product.category ? (
                <p className="mt-1 line-clamp-1 text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--text))]/50">
                  {[product.brand, product.category].filter(Boolean).join(' · ')}
                </p>
              ) : null}
            </div>

            {/* 2. Prix — bloc dédié, reste dans le cadre */}
            <div
              className="mt-4 flex min-w-0 flex-wrap items-baseline gap-2 rounded-lg bg-[hsl(var(--surface-2))]/80 px-3 py-2.5 sm:mt-5 sm:px-3.5 sm:py-3"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={product.price.toFixed(2)} />
              <link
                itemProp="availability"
                href={outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'}
              />
              <span className="text-xl font-extrabold tabular-nums tracking-tight text-[hsl(var(--text))] sm:text-2xl">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && typeof oldPrice === 'number' ? (
                <>
                  <span className="text-sm font-medium text-[hsl(var(--text))]/50 line-through">
                    {formatPrice(oldPrice)}
                  </span>
                  <span className="ml-auto inline-flex rounded-md bg-[hsl(var(--accent)/0.15)] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--accent))]">
                    −{formatPrice(oldPrice - product.price)}
                  </span>
                </>
              ) : null}
            </div>

            {/* 3. Réassurance — une ligne, adaptée au cadre */}
            <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:mt-4">
              {ratingValue > 0 || reviewsCount > 0 ? (
                <span className="flex items-center gap-1 text-[hsl(var(--text))]/70">
                  <RatingStars
                    value={ratingValue}
                    size="xs"
                    editable={false}
                    filledClassName="text-amber-500"
                    emptyClassName="text-[hsl(var(--border))]"
                  />
                  <span className="font-semibold tabular-nums">
                    {ratingValue > 0 ? ratingValue.toFixed(1) : '—'}
                  </span>
                  {reviewsCount > 0 ? (
                    <span className="text-[hsl(var(--text))]/55">({reviewsCount})</span>
                  ) : null}
                </span>
              ) : null}
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium',
                  outOfStock
                    ? 'text-red-600 dark:text-red-400'
                    : lowStock
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[hsl(var(--text))]/60'
                )}
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                {outOfStock ? t('out_of_stock') : lowStock ? t('low_stock') : t('in_stock')}
              </span>
              <FreeShippingBadge price={product.price} minimal />
            </div>

            {/* 4. Action principale — CTA en bas du cadre */}
            <div className="mt-4 shrink-0 sm:mt-5">
              <AddToCartButton
                product={{
                  _id: product._id,
                  slug: product.slug,
                  title,
                  image,
                  price: product.price,
                }}
                stopPropagation
                size="sm"
                variant="solid"
                fullWidth
                withIcon
                idleText={t('add_to_cart')}
                className={cn(
                  'min-h-[3rem] w-full rounded-xl font-bold',
                  'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))]',
                  'transition-all duration-250 ease-[var(--ease-smooth)]',
                  'hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/0.5)] focus-visible:ring-offset-2'
                )}
                ariaLabel={`${t('add_to_cart')} — ${title}`}
              />
            </div>
          </div>
        </Link>
      </div>
    </motion.article>
  );
}

export default memo(ProductCard);
