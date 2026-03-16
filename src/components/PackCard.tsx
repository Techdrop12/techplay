'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react';

import type { Pack } from '@/types/product';

import FreeShippingBadge from '@/components/FreeShippingBadge';
import Link from '@/components/LocalizedLink';
import { BRAND } from '@/lib/constants';
import { pushDataLayer } from '@/lib/ga';
import { getCurrentLocale } from '@/lib/i18n-routing';
import { logEvent } from '@/lib/logEvent';
import { safeProductImageUrl } from '@/lib/safeProductImage';
import { cn, formatPrice } from '@/lib/utils';

interface PackCardProps {
  pack: Pack;
  priority?: boolean;
  className?: string;
}

type UnknownRecord = Record<string, unknown>;

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+';

const STR = {
  fr: {
    packLabel: 'Pack',
    new: 'Nouveau',
    bestSeller: 'Best Seller',
    lowStock: 'Stock faible',
    outOfStock: 'Rupture',
    included: (n: number) => `${n} article${n > 1 ? 's' : ''} inclus`,
    save: 'Vous économisez',
    itemValue: 'Valeur des articles',
    readPack: 'Découvrir le pack',
    avgRating: (v: string) => `Note moyenne : ${v} étoiles`,
    savings: (v: number) => `${v}% d’économie`,
    previewItems: 'Aperçu des articles inclus',
  },
  en: {
    packLabel: 'Bundle',
    new: 'New',
    bestSeller: 'Best Seller',
    lowStock: 'Low stock',
    outOfStock: 'Out of stock',
    included: (n: number) => `${n} item${n > 1 ? 's' : ''} included`,
    save: 'You save',
    itemValue: 'Items value',
    readPack: 'View pack',
    avgRating: (v: string) => `Average rating: ${v} stars`,
    savings: (v: number) => `${v}% savings`,
    previewItems: 'Preview of included items',
  },
} as const;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const getFirstValue = (record: UnknownRecord, keys: readonly string[]): unknown => {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const readString = (record: UnknownRecord, keys: readonly string[]): string | undefined => {
  const value = getFirstValue(record, keys);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

const readNumber = (record: UnknownRecord, keys: readonly string[]): number | undefined => {
  return toFiniteNumber(getFirstValue(record, keys));
};

const readBoolean = (record: UnknownRecord, keys: readonly string[]): boolean | undefined => {
  const value = getFirstValue(record, keys);

  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }

  return undefined;
};

const readArray = (record: UnknownRecord, keys: readonly string[]): unknown[] | undefined => {
  const value = getFirstValue(record, keys);
  return Array.isArray(value) ? value : undefined;
};

const normalizeImageSrc = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (isRecord(value)) return readString(value, ['url', 'src', 'image', 'path']);
  return undefined;
};

const readImageList = (record: UnknownRecord, keys: readonly string[]): string[] | undefined => {
  const value = getFirstValue(record, keys);
  if (!Array.isArray(value)) return undefined;

  const images = value
    .map((entry) => normalizeImageSrc(entry))
    .filter((entry): entry is string => Boolean(entry));

  return images.length ? images : undefined;
};

const readIdString = (record: UnknownRecord, keys: readonly string[]): string | undefined => {
  const value = getFirstValue(record, keys);
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const readItemPrice = (item: unknown): number | undefined => {
  if (!isRecord(item)) return undefined;
  return readNumber(item, ['price', 'prix', 'amount', 'value']);
};

const readItemLabel = (item: unknown): string | undefined => {
  if (!isRecord(item)) return undefined;
  return readString(item, ['title', 'name', 'label']);
};

const SITE_URL = BRAND.URL;

const toAbs = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  if (SITE_URL) return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
  if (typeof window !== 'undefined') return window.location.origin + value;
  return value;
};

export default function PackCard({ pack, priority = false, className }: PackCardProps) {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const t = STR[locale];
  const prefersReducedMotion = useReducedMotion();

  const { slug, title = 'Pack', description, image, price = 0, oldPrice } = pack;

  const packRecord: UnknownRecord = isRecord(pack) ? pack : {};

  const images = readImageList(packRecord, ['images']);
  const compareAtPrice = readNumber(packRecord, [
    'compareAtPrice',
    'compare_at_price',
    'referencePrice',
    'reference_price',
  ]);

  const isNew = readBoolean(packRecord, ['isNew', 'new']);
  const isBestSeller = readBoolean(packRecord, ['isBestSeller', 'bestSeller', 'bestseller']);
  const stock = readNumber(packRecord, ['stock']);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- items from readArray, used in useMemos below
  const items = readArray(packRecord, ['items', 'contents']) ?? [];
  const rating = readNumber(packRecord, ['rating']);
  const reviewsCount = readNumber(packRecord, ['reviewsCount', 'reviews']);
  const sku = readString(packRecord, ['sku']) ?? readIdString(packRecord, ['id']);
  const brand = readString(packRecord, ['brand']);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const cardRef = useRef<HTMLDivElement | null>(null);
  const viewedRef = useRef(false);
  const tickingRef = useRef(false);

  const mainImage = useMemo(() => {
    const first = images?.[0] ?? normalizeImageSrc(image);
    const raw = imageError ? '/og-image.jpg' : first || '/og-image.jpg';
    return safeProductImageUrl(raw);
  }, [image, imageError, images]);

  const itemsValue = useMemo(() => {
    if (!items.length) return undefined;

    let sum = 0;
    for (const item of items) {
      const value = readItemPrice(item);
      if (typeof value === 'number') sum += value;
    }

    return sum > 0 ? sum : undefined;
  }, [items]);

  const referencePrice =
    typeof oldPrice === 'number' && oldPrice > price
      ? oldPrice
      : typeof compareAtPrice === 'number' && compareAtPrice > price
        ? compareAtPrice
        : typeof itemsValue === 'number' && itemsValue > price
          ? itemsValue
          : undefined;

  const discountPercent = useMemo(() => {
    return typeof referencePrice === 'number' && referencePrice > price
      ? Math.round(((referencePrice - price) / referencePrice) * 100)
      : null;
  }, [price, referencePrice]);

  const savingsEuro = useMemo(() => {
    return typeof referencePrice === 'number' && referencePrice > price
      ? Math.max(0, referencePrice - price)
      : null;
  }, [price, referencePrice]);

  const urlPath = slug ? `/products/packs/${slug}` : '/products/packs';

  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5;
  const outOfStock = typeof stock === 'number' && stock <= 0;
  const hasRating = typeof rating === 'number' && !Number.isNaN(rating);
  const formattedRating = hasRating ? rating.toFixed(1) : null;

  const itemChips = useMemo(() => {
    if (!items.length) return [];

    const labels: string[] = [];
    for (const item of items) {
      const label = readItemLabel(item);
      if (label) labels.push(label);
      if (labels.length >= 3) break;
    }
    return labels;
  }, [items]);

  const srId = useId();
  const srMessages: string[] = [];

  if (typeof discountPercent === 'number') srMessages.push(t.savings(discountPercent));
  if (lowStock) srMessages.push(t.lowStock);
  if (outOfStock) srMessages.push(t.outOfStock);

  const ariaDescribedBy = srMessages.length ? srId : undefined;

  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || viewedRef.current) continue;

          viewedRef.current = true;

          try {
            logEvent({
              action: 'pack_card_view',
              category: 'engagement',
              label: title,
              value: price,
            });
          } catch {
            // no-op
          }

          try {
            pushDataLayer({
              event: 'view_pack_card',
              items: [{ item_id: slug, item_name: title, price }],
            });
          } catch {
            // no-op
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [price, slug, title]);

  const handleClick = useCallback(() => {
    try {
      logEvent({
        action: 'pack_card_click',
        category: 'engagement',
        label: title,
        value: price,
      });
    } catch {
      // no-op
    }

    try {
      pushDataLayer({
        event: 'select_pack',
        items: [{ item_id: slug, item_name: title, price }],
      });
    } catch {
      // no-op
    }
  }, [price, slug, title]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    try {
      if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return;
    } catch {
      // no-op
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const ry = clamp((dx / (rect.width / 2)) * 6, -8, 8);
    const rx = clamp((-dy / (rect.height / 2)) * 6, -8, 8);

    if (tickingRef.current) return;

    tickingRef.current = true;
    requestAnimationFrame(() => {
      setTilt({ rx, ry });
      tickingRef.current = false;
    });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const articleStyle = useMemo<CSSProperties>(() => {
    return {
      perspective: 1000,
      background:
        'linear-gradient(145deg, hsl(var(--accent) / 0.12) 0%, rgba(255,255,255,0.06) 35%, transparent 60%)',
    };
  }, []);

  return (
    <motion.article
      ref={cardRef}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-[1.75rem] border border-[hsl(var(--accent)/0.22)] p-[2px]',
        'shadow-[0_16px_48px_rgba(15,23,42,0.12),0_0_0_1px_hsl(var(--accent)/0.08)]',
        'transition-all duration-300 ease-[var(--ease-smooth)]',
        'hover:shadow-[0_24px_56px_rgba(15,23,42,0.18),0_0_0_1px_hsl(var(--accent)/0.2),0_0_32px_hsl(var(--accent)/0.08)] hover:-translate-y-1.5 hover:border-[hsl(var(--accent)/0.4)]',
        className
      )}
      style={articleStyle}
      whileHover={!prefersReducedMotion ? { y: -4 } : undefined}
      transition={{ duration: prefersReducedMotion ? 0 : 0.28, ease: [0.33, 1, 0.68, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      aria-describedby={ariaDescribedBy}
      data-pack-id={slug}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={toAbs(mainImage)} />
      <meta itemProp="url" content={toAbs(urlPath)} />
      {brand ? <meta itemProp="brand" content={brand} /> : null}
      {sku ? <meta itemProp="sku" content={sku} /> : null}

      {hasRating && formattedRating ? (
        <div
          itemProp="aggregateRating"
          itemScope
          itemType="https://schema.org/AggregateRating"
          className="hidden"
        >
          <meta itemProp="ratingValue" content={formattedRating} />
          {typeof reviewsCount === 'number' ? (
            <meta itemProp="reviewCount" content={String(Math.max(0, reviewsCount))} />
          ) : null}
        </div>
      ) : null}

      <motion.div
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'border border-[hsl(var(--border))]',
          'bg-[hsl(var(--surface))]/98 dark:bg-[hsl(var(--surface))]/92 supports-[backdrop-filter]:backdrop-blur-2xl'
        )}
        style={
          !prefersReducedMotion
            ? { rotateX: tilt.rx, rotateY: tilt.ry, transformStyle: 'preserve-3d' as const }
            : undefined
        }
      >
        {/* Pack identity: accent stripe + bundle label */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 z-20 h-1 rounded-t-[1.5rem] bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--accent)/0.8)] to-[hsl(var(--accent)/0.5)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(800px 280px at 20% -5%, hsl(var(--accent)/0.04), transparent 55%)',
          }}
        />

        <Link
          href={urlPath}
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950/80"
          onClick={handleClick}
          aria-label={t.readPack}
        >
          <div
            className="card-shine relative aspect-[4/3] w-full overflow-hidden rounded-[1.45rem] bg-[hsl(var(--surface-2))] sm:aspect-[16/9]"
            aria-busy={!imageLoaded}
          >
            <Image
              src={mainImage}
              alt={title}
              fill
              sizes="(min-width:1280px) 28vw, (min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={88}
              decoding="async"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className="object-cover transition-transform duration-500 ease-[var(--ease-smooth)] will-change-transform group-hover:scale-[1.06]"
            />

            {!imageLoaded ? (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200/75 via-slate-100/40 to-white/10 dark:from-slate-800/65 dark:via-slate-900/40 dark:to-slate-950/80"
                aria-hidden="true"
              />
            ) : null}

            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--surface))]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--accent))] shadow-sm backdrop-blur-sm dark:bg-[hsl(var(--surface))]/90">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 7h-3.17a3 3 0 1 0-5.66-2 3 3 0 1 0-5.66 2H2v4h2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9h2V7h-2Z" />
                </svg>
                {t.packLabel}
              </span>
              {isNew ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-950 shadow-[0_12px_35px_rgba(4,120,87,0.7)] ring-1 ring-emerald-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/90" />
                  {t.new}
                </span>
              ) : null}

              {isBestSeller ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950 shadow-[0_12px_35px_rgba(120,53,15,0.55)] ring-1 ring-amber-900/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t.bestSeller}
                </span>
              ) : null}

              {typeof discountPercent === 'number' ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-50 shadow-[0_12px_35px_rgba(127,29,29,0.7)] ring-1 ring-red-900/40"
                  aria-label={t.savings(discountPercent)}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-200" />-{discountPercent}%
                </span>
              ) : null}

              {lowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950 ring-1 ring-amber-800/35 dark:bg-amber-400/90 dark:text-amber-950">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t.lowStock}
                </span>
              ) : null}
            </div>

            {hasRating && formattedRating ? (
              <div
                className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1.5 text-[11px] shadow-[0_14px_40px_rgba(15,23,42,0.8)] backdrop-blur-xl text-amber-50 sm:right-4 sm:top-4"
                aria-label={t.avgRating(formattedRating)}
              >
                <span className="drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">★</span>{' '}
                {formattedRating}
              </div>
            ) : null}

            {outOfStock ? (
              <div
                className="absolute inset-0 grid place-items-center bg-black/55 text-xs font-semibold uppercase tracking-[0.18em] text-white/90"
                aria-hidden="true"
              >
                {t.outOfStock}
              </div>
            ) : null}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Bloc contenu — structure : identité → valeur pack → prix → économie → action */}
          <div className="border-t border-[hsl(var(--border))]/50 bg-[hsl(var(--surface))]/40 p-4 sm:p-5">
            {/* 1. Identité + valeur pack */}
            <h3
              className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-base"
              title={title}
            >
              {title}
            </h3>
            {items.length > 0 ? (
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--accent))]">
                {t.included(items.length)}
              </p>
            ) : null}

            {itemChips.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={t.previewItems}>
                {itemChips.map((label, index) => (
                  <li
                    key={`${label}-${index}`}
                    className="rounded-md border border-[hsl(var(--accent)/0.2)] bg-[hsl(var(--accent)/0.06)] px-2 py-0.5 text-[11px] font-medium text-token-text/85"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}

            {description ? (
              <p className="mt-2 line-clamp-2 text-[12px] text-token-text/65">{description}</p>
            ) : null}

            {/* 2. Prix — bloc dédié */}
            <div
              className="mt-4 flex flex-wrap items-baseline gap-2 rounded-lg bg-[hsl(var(--surface-2))]/90 px-3 py-2.5 sm:py-3"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="itemCondition" content="https://schema.org/NewCondition" />
              <link
                itemProp="availability"
                href={outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'}
              />
              <meta itemProp="price" content={Math.max(0, Number(price || 0)).toFixed(2)} />
              <span
                className="text-xl font-extrabold tracking-tight text-[hsl(var(--accent))] sm:text-2xl"
                aria-label={`Prix : ${formatPrice(price)}`}
              >
                {formatPrice(price)}
              </span>
              {typeof referencePrice === 'number' && referencePrice > price ? (
                <>
                  <span className="text-sm text-token-text/50 line-through">
                    {formatPrice(referencePrice)}
                  </span>
                  {typeof discountPercent === 'number' ? (
                    <span className="ml-auto rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      −{discountPercent}%
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            {/* 3. Économie — une ligne si applicable */}
            {typeof savingsEuro === 'number' && savingsEuro > 0 ? (
              <p className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                {t.save} {formatPrice(savingsEuro)}
                {typeof itemsValue === 'number' ? (
                  <span className="ml-1 font-normal text-token-text/60">
                    ({t.itemValue} {formatPrice(itemsValue)})
                  </span>
                ) : null}
              </p>
            ) : null}

            {/* 4. Action + livraison */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:mt-5">
              <span className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[13px] font-bold text-[hsl(var(--accent-foreground))] transition-opacity group-hover:opacity-95">
                {t.readPack}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    fill="currentColor"
                    d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
                  />
                </svg>
              </span>
              <FreeShippingBadge price={price} minimal className="mt-0" />
            </div>
          </div>
        </Link>
      </motion.div>

      {ariaDescribedBy ? (
        <p id={srId} className="sr-only" aria-live="polite">
          {srMessages.join('. ')}
        </p>
      ) : null}
    </motion.article>
  );
}
