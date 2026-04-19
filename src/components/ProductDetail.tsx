'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type PointerEventHandler,
} from 'react';
import { toast } from 'react-hot-toast';
import { FaCcMastercard, FaCcPaypal, FaCcVisa } from 'react-icons/fa';

import type { AggregateRating, Product, Review } from '@/types/product';

import AddToCartButtonAB from '@/components/AddToCartButtonAB';
import FreeShippingBadge from '@/components/FreeShippingBadge';
import PricingBadge from '@/components/PricingBadge';
import ProductReviews from '@/components/Product/ProductReviews';
import ProductTags from '@/components/ProductTags';
import QuantitySelector from '@/components/QuantitySelector';
import RatingStars from '@/components/RatingStars';
import RatingSummary from '@/components/RatingSummary';
import ReviewForm from '@/components/ReviewForm';
import ShippingSimulator from '@/components/ShippingSimulator';
import DeliveryEstimate from '@/components/ui/DeliveryEstimate';
import WishlistButton from '@/components/WishlistButton';
import { detectCurrency } from '@/lib/currency';
import {
  mapProductToGaItem,
  trackAddToCart,
  trackAddToWishlist,
  trackSelectItem,
  trackViewItem,
} from '@/lib/ga';
import { DEFAULT_LOCALE, isLocale, type AppLocale } from '@/lib/language';
import { logEvent } from '@/lib/logEvent';
import { pixelViewContent } from '@/lib/meta-pixel';
import { safeProductImageUrl } from '@/lib/safeProductImage';
import { cn, formatPrice, intlLocaleForStoreRoute } from '@/lib/utils';

interface Props {
  product: Product;
  locale?: string;
}

type RecentProduct = {
  _id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
};

type ProductLike = Product & Record<string, unknown>;

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function toNum(value: unknown): number | undefined {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : NaN;

  return Number.isFinite(parsed) ? parsed : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function buildGallery(product: ProductLike): string[] {
  const pool = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ];

  const urls = Array.from(
    new Set(
      pool.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    )
  ).slice(0, 8);
  return urls.map((url) => safeProductImageUrl(url));
}

function computeAggregate(
  ratingFromProduct: number | undefined,
  reviews: Review[] | undefined,
  aggregate?: AggregateRating
): AggregateRating {
  if (aggregate?.total && typeof aggregate.average === 'number') {
    return aggregate;
  }

  const list = Array.isArray(reviews) ? reviews : [];
  const total = list.length;

  if (total > 0) {
    const breakdown: Partial<Record<1 | 2 | 3 | 4 | 5, number>> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let sum = 0;
    let counted = 0;

    for (const review of list) {
      const value = toNum(review?.rating);
      if (value && value >= 1 && value <= 5) {
        const safeRating = value as 1 | 2 | 3 | 4 | 5;
        breakdown[safeRating] = (breakdown[safeRating] || 0) + 1;
        sum += safeRating;
        counted += 1;
      }
    }

    return {
      average: counted ? Math.max(0, Math.min(5, sum / counted)) : (ratingFromProduct ?? 0),
      total,
      breakdownCount: breakdown,
    };
  }

  return {
    average:
      typeof ratingFromProduct === 'number' ? Math.max(0, Math.min(5, ratingFromProduct)) : 0,
    total: aggregate?.total ?? 0,
    breakdownCount: aggregate?.breakdownCount,
  };
}

function toGaSource(product: Product): Record<string, unknown> {
  return product as Record<string, unknown>;
}

function IconShare({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M14 3l7 7-7 7v-4h-1.5A7.5 7.5 0 0 1 5 5.5V4a1 1 0 0 1 1-1h1.5A7.5 7.5 0 0 0 12.5 10H14V3zM6 20h12v2H6z"
      />
    </svg>
  );
}

export default function ProductDetail({ product, locale = 'fr' }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const viewedRef = useRef(false);

  const safeLocale: AppLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const currency = detectCurrency(safeLocale);
  const priceLocale = intlLocaleForStoreRoute(safeLocale);

  const t =
    safeLocale === 'en'
      ? {
          newLabel: 'New',
          bestSeller: 'Best seller',
          reviews: 'reviews',
          stock: 'In stock',
          lowStock: 'Only',
          lowStockSuffix: 'left in stock',
          outOfStock: 'Out of stock',
          hurry: 'Hurry up, almost sold out',
          quantity: 'Quantity',
          quantityHelp: 'Choose the quantity to add to cart',
          unavailable: 'Currently unavailable',
          notifyMe: 'Notify me',
          share: 'Share',
          copied: 'Link copied to clipboard',
          imageLabel: 'Image',
          of: 'of',
          imageHelp: 'Click or press Enter/Space to zoom the image.',
          imageHelpOut: 'Click or press Enter/Space to zoom out the image.',
          payments: 'Payments:',
          returns: 'Free 30-day returns',
          secured: 'Secure payment',
          shipping: 'International shipping',
          deliveryReturns: 'Delivery & returns',
          specs: 'Specifications',
          detailedSpecs: 'Detailed specifications available on the product sheet.',
          brand: 'Brand',
          acceptedPayments: 'Accepted payments: Visa, Mastercard, PayPal',
          addToCart: 'Add to cart',
          notifyToast: 'We can notify you when it comes back.',
          galleryLabel: 'Product gallery thumbnails',
          save: 'Save',
          reviewsSectionAria: 'Customer reviews',
        }
      : {
          newLabel: 'Nouveau',
          bestSeller: 'Best Seller',
          reviews: 'avis',
          stock: 'En stock',
          lowStock: 'Plus que',
          lowStockSuffix: 'en stock',
          outOfStock: 'Rupture',
          hurry: 'Dépêchez-vous, bientôt épuisé',
          quantity: 'Quantité',
          quantityHelp: 'Sélectionnez la quantité à ajouter au panier',
          unavailable: 'Indisponible actuellement',
          notifyMe: 'Me prévenir',
          share: 'Partager',
          copied: 'Lien copié dans le presse-papier',
          imageLabel: 'Image',
          of: 'sur',
          imageHelp: 'Cliquer ou appuyer sur Entrée/Espace pour zoomer l’image.',
          imageHelpOut: 'Cliquer ou appuyer sur Entrée/Espace pour dézoomer l’image.',
          payments: 'Paiements :',
          returns: 'Retours gratuits 30 jours',
          secured: 'Paiement sécurisé',
          shipping: 'Expédition internationale',
          deliveryReturns: 'Livraison & retours',
          specs: 'Spécifications',
          detailedSpecs: 'Caractéristiques détaillées disponibles sur la fiche.',
          brand: 'Marque',
          acceptedPayments: 'Paiements acceptés : Visa, Mastercard, PayPal',
          addToCart: 'Ajouter au panier',
          notifyToast: '🔔 Nous pouvons vous prévenir quand il revient.',
          galleryLabel: 'Miniatures du produit',
          save: 'Économisez',
          reviewsSectionAria: 'Avis clients',
        };

  const source = product as ProductLike;

  const _id = String(product._id || '');
  const slug = readString(product.slug) || '';
  const title = readString(product.title) || 'Produit';
  const description = readString(product.description) || '';
  const brand = readString(product.brand);
  const category = readString(product.category);
  const sku = readString(source.sku);
  const image = safeProductImageUrl(readString(product.image)) || '/og-image.jpg';
  const price = Math.max(0, toNum(product.price) ?? 0);
  const oldPrice = toNum(product.oldPrice);
  const rating = toNum(product.rating);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reviews/safeGallery from product, used in useMemo/useEffect
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewsCount = toNum(product.reviewsCount);
  const isNew = Boolean(product.isNew);
  const isBestSeller = Boolean(product.isBestSeller);
  const stock = toNum(product.stock);
  const tags = Array.isArray(source.tags)
    ? source.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : [];

  const gallery = useMemo(() => buildGallery(source), [source]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- safeGallery derived from gallery
  const safeGallery = gallery.length > 0 ? gallery : [image];

  const [quantity, setQuantity] = useState(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [notifying, setNotifying] = useState(false);

  const activeImage = safeGallery[activeIdx] || image;
  const total = useMemo(() => price * quantity, [price, quantity]);

  const aggregate = useMemo(
    () => computeAggregate(rating, reviews, product.aggregateRating),
    [rating, reviews, product.aggregateRating]
  );

  const totalReviews = aggregate.total || reviewsCount || 0;
  const discount =
    typeof oldPrice === 'number' && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const amountSaved = typeof oldPrice === 'number' && oldPrice > price ? oldPrice - price : null;

  const availability =
    typeof stock === 'number'
      ? stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5;
  const outOfStock = typeof stock === 'number' && stock <= 0;
  const priceStr = price.toFixed(2);

  useEffect(() => {
    if (!sectionRef.current || viewedRef.current) return;

    const el = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (!visible || viewedRef.current) return;

        viewedRef.current = true;

        try {
          logEvent({
            action: 'product_detail_view',
            category: 'engagement',
            label: title,
            value: price,
          });
        } catch {
          // no-op
        }

        try {
          trackViewItem({
            currency,
            value: price,
            items: [{ ...mapProductToGaItem(toGaSource(product)), quantity: 1 }],
          });
        } catch {
          // no-op
        }

        try {
          pixelViewContent({
            value: price,
            currency,
            content_name: title,
            content_type: 'product',
            content_ids: [String(product._id ?? product.slug ?? '')].filter(Boolean),
            contents: [
              {
                id: String(product._id ?? product.slug ?? ''),
                quantity: 1,
                item_price: price,
              },
            ],
          });
        } catch {
          // no-op
        }

        try {
          const key = 'recent:products';
          const prev = JSON.parse(localStorage.getItem(key) || '[]') as RecentProduct[];
          const next = [
            { _id, slug, title, price, image: safeGallery[0] ?? image },
            ...prev.filter((item) => item._id !== _id),
          ].slice(0, 16);
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // no-op
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [_id, currency, image, price, product, safeGallery, slug, title]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;

      if (editable) return;

      if (event.key === '+') setQuantity((q) => clamp(q + 1, 1, 99));
      if (event.key === '-') setQuantity((q) => clamp(q - 1, 1, 99));
      if (event.key === 'ArrowLeft') setActiveIdx((i) => Math.max(0, i - 1));
      if (event.key === 'ArrowRight') setActiveIdx((i) => Math.min(safeGallery.length - 1, i + 1));
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [safeGallery.length]);

  useEffect(() => {
    if (typeof window === 'undefined' || safeGallery.length <= 1) return;

    const nextIndex = (activeIdx + 1) % safeGallery.length;
    const prevIndex = (activeIdx - 1 + safeGallery.length) % safeGallery.length;

    for (const src of [safeGallery[nextIndex], safeGallery[prevIndex]]) {
      if (!src) continue;
      const img = new window.Image();
      img.src = src;
    }
  }, [activeIdx, safeGallery]);

  const onAddToCart = useCallback(() => {
    try {
      logEvent({
        action: 'add_to_cart',
        category: 'ecommerce',
        label: title,
        value: total,
      });
    } catch {
      // no-op
    }

    try {
      trackAddToCart({
        currency,
        value: total,
        items: [{ ...mapProductToGaItem(toGaSource(product)), quantity }],
      });
    } catch {
      // no-op
    }
  }, [currency, product, quantity, title, total]);

  const onAddWishlist = useCallback(() => {
    try {
      logEvent({
        action: 'add_to_wishlist',
        category: 'ecommerce',
        label: title,
        value: price,
      });
    } catch {
      // no-op
    }

    try {
      trackAddToWishlist({
        currency,
        value: price,
        items: [{ ...mapProductToGaItem(toGaSource(product)), quantity: 1 }],
      });
    } catch {
      // no-op
    }
  }, [currency, price, product, title]);

  const onThumbSelect = (idx: number) => {
    setActiveIdx(idx);

    try {
      trackSelectItem({
        currency,
        value: price,
        items: [{ ...mapProductToGaItem(toGaSource(product)), quantity: 1 }],
        item_list_name: 'product_gallery',
      });
    } catch {
      // no-op
    }
  };

  const share = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';

      if (
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share({ title, text: title, url });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(t.copied);
      }
    } catch {
      // no-op
    }
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!mediaRef.current || !zoomed) return;

    const rect = mediaRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setOrigin({
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    });
  };

  const toggleZoom = () => {
    if (prefersReducedMotion) return;
    setZoomed((value) => !value);
  };

  const onMediaKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleZoom();
    }

    if (event.key === 'ArrowLeft') {
      setActiveIdx((i) => Math.max(0, i - 1));
    }

    if (event.key === 'ArrowRight') {
      setActiveIdx((i) => Math.min(safeGallery.length - 1, i + 1));
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:gap-10 sm:px-6 sm:py-12 sm:pb-12 lg:gap-12 lg:grid-cols-2"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-labelledby="product-title"
      data-product-id={_id || slug}
      data-product-slug={slug}
      role="region"
      aria-live="polite"
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="flex flex-col gap-5 sm:gap-8 min-w-0">
        {/* Main image: framed for emphasis; less frame padding on mobile */}
        <div className="rounded-2xl bg-[hsl(var(--surface-2))] p-2 shadow-[var(--shadow-lg)] sm:p-3">
          <div
            ref={mediaRef}
            className={cn(
              'relative aspect-square w-full overflow-hidden rounded-xl',
              'border border-[hsl(var(--border))]',
              'bg-[hsl(var(--surface))] shadow-[var(--shadow-md)]'
            )}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setZoomed(false)}
            onClick={toggleZoom}
            onKeyDown={onMediaKeyDown}
            role="button"
            aria-label={`${t.imageLabel} ${activeIdx + 1} ${t.of} ${safeGallery.length} : ${title}`}
            aria-busy={!imgLoaded}
            tabIndex={0}
          >
            <Image
              key={activeImage}
              src={activeImage}
              alt={`${t.imageLabel} ${activeIdx + 1} ${t.of} ${safeGallery.length} - ${title}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className={cn(
                'object-cover transition-transform duration-700 will-change-transform',
                zoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in hover:scale-[1.03]'
              )}
              style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
              onLoad={() => setImgLoaded(true)}
              itemProp="image"
              draggable={false}
            />

            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-[hsl(var(--surface-2))] via-[hsl(var(--surface))] to-[hsl(var(--surface-2))]"
                aria-hidden="true"
              />
            )}

            <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1.5 sm:left-5 sm:top-5">
              {isNew ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-950 shadow-[0_12px_35px_rgba(4,120,87,0.7)] ring-1 ring-emerald-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-900/90" />
                  {t.newLabel}
                </span>
              ) : null}

              {isBestSeller ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-950 shadow-[0_12px_35px_rgba(120,53,15,0.55)] ring-1 ring-amber-900/35">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700" />
                  {t.bestSeller}
                </span>
              ) : null}

              {discount ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/95 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-50 shadow-[0_12px_35px_rgba(127,29,29,0.7)] ring-1 ring-red-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-200" />-{discount}%
                </span>
              ) : null}
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <PricingBadge price={price} oldPrice={oldPrice} showDiscountLabel showOldPrice />
            </div>

            <div className="absolute right-4 top-4 z-10 flex gap-2 sm:right-5 sm:top-5">
              <button
                type="button"
                onClick={share}
                className="rounded-full border border-white/20 bg-black/40 px-3.5 py-2.5 text-white shadow-[0_12px_35px_rgba(15,23,42,0.7)] backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                aria-label={t.share}
                title={t.share}
              >
                <IconShare size={18} />
              </button>
            </div>

            <p className="sr-only">{zoomed ? t.imageHelpOut : t.imageHelp}</p>
          </div>
        </div>

        {safeGallery.length > 1 ? (
          <nav aria-label={t.galleryLabel} className="flex flex-col gap-3">
            <ul
              role="list"
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 sm:gap-4 sm:flex-wrap sm:overflow-visible sm:pb-0"
            >
              {safeGallery.map((src, idx) => {
                const active = idx === activeIdx;

                return (
                  <li key={`${src}-${idx}`} className="shrink-0 snap-start sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => onThumbSelect(idx)}
                      onMouseEnter={() => !prefersReducedMotion && setActiveIdx(idx)}
                      className={cn(
                        'relative flex h-20 w-20 overflow-hidden rounded-xl border transition-all duration-200 sm:h-24 sm:w-24',
                        active
                          ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))] ring-offset-2 ring-offset-[hsl(var(--surface))] shadow-[var(--shadow-md)]'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/.5)] hover:shadow-[var(--shadow-sm)]'
                      )}
                      aria-label={`${t.imageLabel} ${idx + 1}`}
                      aria-current={active ? 'true' : undefined}
                    >
                      <Image
                        src={src}
                        alt={title ? `${title} (${idx + 1})` : ''}
                        fill
                        sizes="96px"
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </div>

      {/* Colonne droite : titre + bloc achat — sticky desktop pour mise en scène commerciale */}
      <div className="flex flex-col gap-6 sm:gap-8 lg:sticky lg:top-24 lg:self-start lg:gap-6">
        <div className="min-w-0">
          <h1
            id="product-title"
            className="text-[1.75rem] font-extrabold leading-snug tracking-tight text-[hsl(var(--text))] sm:text-3xl lg:text-2xl [letter-spacing:var(--heading-tracking)]"
            tabIndex={-1}
            itemProp="name"
          >
            {title}
          </h1>
          {_id || sku ? <meta itemProp="sku" content={String(_id || sku)} /> : null}
          {brand ? <meta itemProp="brand" content={brand} /> : null}
          {brand || category ? (
            <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-token-text/55">
              {[brand, category].filter(Boolean).join(' · ')}
            </p>
          ) : null}
        </div>

        {/* Purchase section: price + CTA + trust — touch-friendly on mobile */}
        <div
          className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] sm:p-6"
          aria-label={safeLocale === 'en' ? 'Purchase options' : 'Options d’achat'}
        >
          {/* Prix — bloc dédié */}
          <div
            className="flex flex-wrap items-baseline gap-3 rounded-lg bg-[hsl(var(--surface-2))]/80 px-3 py-3 sm:px-4 sm:py-3.5"
            aria-live="polite"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content={currency} />
            <meta itemProp="price" content={priceStr} />
            <meta itemProp="availability" content={availability} />
            <span
              className="text-[2rem] font-extrabold tabular-nums tracking-tight text-[hsl(var(--accent))] sm:text-3xl"
              aria-label={
                safeLocale === 'en'
                  ? `Price: ${formatPrice(price, { currency, locale: priceLocale })}`
                  : `Prix : ${formatPrice(price, { currency, locale: priceLocale })}`
              }
            >
              {formatPrice(price, { currency, locale: priceLocale })}
            </span>
            {typeof oldPrice === 'number' && oldPrice > price ? (
              <span className="text-base font-medium text-token-text/50 line-through">
                {formatPrice(oldPrice, { currency, locale: priceLocale })}
              </span>
            ) : null}
            {discount && amountSaved ? (
              <span className="ml-auto rounded-md bg-[hsl(var(--accent)/0.12)] px-2.5 py-1 text-[12px] font-bold text-[hsl(var(--accent))]">
                {t.save} {formatPrice(amountSaved, { currency, locale: priceLocale })} (−{discount}%)
              </span>
            ) : null}
            {quantity > 1 ? (
              <span className="w-full text-[13px] text-token-text/70 sm:w-auto">
                Total ({quantity}×)&nbsp;:{' '}
                <span className="font-semibold text-[hsl(var(--text))]">
                  {formatPrice(total, { currency, locale: priceLocale })}
                </span>
              </span>
            ) : null}
          </div>

          {/* Réassurance — au-dessus du CTA */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-[hsl(var(--surface-2))]/50 px-3 py-2.5 text-[12px] sm:gap-x-5">
            <span className="inline-flex items-center gap-1.5 text-token-text/80">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                aria-hidden="true"
              >
                ✓
              </span>
              {t.shipping}
            </span>
            <span className="inline-flex items-center gap-1.5 text-token-text/80">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400"
                aria-hidden="true"
              >
                🔒
              </span>
              {t.returns}
            </span>
            <span className="inline-flex items-center gap-1.5 text-token-text/80">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                aria-hidden="true"
              >
                ⚡
              </span>
              {t.secured}
            </span>
          </div>

          {/* Quantité + CTA */}
          <div className="mt-5 space-y-4">
            <div className="flex min-h-[44px] flex-col justify-center gap-3 xs:flex-row xs:items-center xs:gap-4">
              <label
                htmlFor="quantity"
                className="text-sm font-semibold text-[hsl(var(--text))] sm:text-sm"
              >
                {t.quantity}
              </label>
              <QuantitySelector
                value={quantity}
                onChange={(q) => setQuantity(clamp(q, 1, 99))}
                id="quantity"
                aria-describedby="quantity-desc"
              />
            </div>
            <p id="quantity-desc" className="sr-only">
              {t.quantityHelp}
            </p>
            {!outOfStock ? (
              <div className="space-y-2">
                <AddToCartButtonAB
                  product={{
                    _id,
                    slug,
                    title,
                    price,
                    image: safeGallery[0] ?? image,
                    quantity,
                  }}
                  locale={safeLocale}
                  onAdd={onAddToCart}
                  gtmExtra={{
                    from: 'pdp',
                    product_id: _id,
                    product_slug: slug,
                    product_title: title,
                    product_price: price,
                    product_category: category ?? undefined,
                  }}
                  size="lg"
                  fullWidth
                  className="min-h-[56px] py-4 text-base font-bold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 sm:min-h-[52px] sm:py-3.5"
                  aria-label={`${t.addToCart} ${title}`}
                />
                <p className="text-center text-[12px] text-token-text/60" role="status">
                  {safeLocale === 'en'
                    ? 'Secure checkout · Free returns'
                    : 'Paiement sécurisé · Retours gratuits'}
                </p>
              </div>
            ) : (
              <div
                className="inline-flex min-h-[48px] flex-wrap items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 sm:min-h-0"
                role="alert"
              >
                {t.unavailable}
                <button
                  type="button"
                  disabled={notifying}
                  aria-busy={notifying ? 'true' : 'false'}
                  onClick={() => {
                    if (notifying) return;
                    setNotifying(true);
                    toast(t.notifyToast);
                    window.setTimeout(() => setNotifying(false), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] font-medium underline underline-offset-2 hover:no-underline disabled:opacity-60 sm:min-h-0 sm:min-w-0"
                >
                  {notifying && (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" fill="none" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                    </svg>
                  )}
                  {t.notifyMe}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Supporting: rating, stock, delivery, description, tags */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <RatingStars value={aggregate.average || 0} editable={false} />
            {totalReviews > 0 ? (
              <a
                href="#reviews"
                className="text-[13px] font-medium text-[hsl(var(--accent))] underline underline-offset-2 transition hover:opacity-90"
                onClick={() => {
                  try {
                    logEvent({
                      action: 'jump_to_reviews',
                      category: 'engagement',
                      label: slug || title,
                    });
                  } catch {
                    // no-op
                  }
                }}
              >
                {totalReviews} {t.reviews}
              </a>
            ) : null}
            <FreeShippingBadge price={price} minimal />
            {typeof stock === 'number' ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                  stock > 0
                    ? lowStock
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                )}
                aria-live="polite"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {stock > 0
                  ? lowStock
                    ? `${t.lowStock} ${stock} ${t.lowStockSuffix}`
                    : t.stock
                  : t.outOfStock}
              </span>
            ) : null}
          </div>
          {lowStock ? (
            <div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, ((stock || 0) / 5) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                {t.hurry}
              </p>
            </div>
          ) : null}
          <DeliveryEstimate />
          {description ? (
            <p
              className="whitespace-pre-line text-[15px] leading-relaxed text-token-text/85 sm:text-base"
              itemProp="description"
            >
              {description}
            </p>
          ) : null}
          {tags.length > 0 ? (
            <div>
              <ProductTags tags={tags} />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex min-h-[44px] items-center sm:min-h-0" onClick={onAddWishlist}>
            <WishlistButton
              product={{
                _id,
                slug,
                title,
                price,
                image: safeGallery[0] ?? image,
              }}
              floating={false}
              className="mt-0 sm:mt-2"
            />
          </div>

          <button
            type="button"
            onClick={share}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-[13px] font-medium transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 dark:bg-black/20 dark:hover:bg-black/30 sm:min-h-0 sm:min-w-0 sm:py-2.5"
            aria-label={t.share}
            title={t.share}
          >
            <IconShare size={18} />
            <span>{t.share}</span>
          </button>

          <div className="ml-auto mt-2 flex items-center gap-3 text-xl text-token-text/50">
            <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-token-text/60">
              {t.payments}
            </span>
            <FaCcVisa
              aria-hidden="true"
              title="Visa"
              className="transition-opacity hover:opacity-80"
            />
            <FaCcMastercard
              aria-hidden="true"
              title="Mastercard"
              className="transition-opacity hover:opacity-80"
            />
            <FaCcPaypal
              aria-hidden="true"
              title="PayPal"
              className="transition-opacity hover:opacity-80"
            />
            <span className="sr-only">{t.acceptedPayments}</span>
          </div>
        </div>

        <div className="mt-2">
          <ShippingSimulator minDays={2} maxDays={3} businessDaysOnly />
        </div>

        <div className="mt-2 grid gap-2">
          <details className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/50 p-3.5">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[13px] font-semibold text-token-text [&::-webkit-details-marker]:hidden">
              {t.deliveryReturns}
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-token-text/70">
              <li>
                {safeLocale === 'en'
                  ? 'International tracked delivery'
                  : 'Livraison internationale suivie'}
              </li>
              <li>
                {safeLocale === 'en'
                  ? 'Free return within 30 days'
                  : 'Retour gratuit sous 30 jours'}
              </li>
              <li>{safeLocale === 'en' ? 'Real-time order tracking' : 'Suivi colis temps réel'}</li>
            </ul>
          </details>

          <details className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]/50 p-3.5">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[13px] font-semibold text-token-text [&::-webkit-details-marker]:hidden">
              {t.specs}
            </summary>
            <p className="mt-2 text-[13px] text-token-text/70">
              {brand ? (
                <>
                  {t.brand}&nbsp;: <strong>{brand}</strong>
                </>
              ) : (
                t.detailedSpecs
              )}
            </p>
          </details>
        </div>
      </div>

      <div className="mt-12 lg:col-span-2" id="reviews" aria-label={t.reviewsSectionAria}>
        <div className="mb-6">
          <RatingSummary
            average={aggregate.average}
            total={totalReviews}
            breakdownCount={aggregate.breakdownCount}
            jsonLd={{ productSku: _id, productName: title }}
          />
        </div>

        {reviews.length > 0 ? (
          <div className="mb-10">
            <ProductReviews reviews={reviews} />
          </div>
        ) : null}

        <ReviewForm productId={_id} />
      </div>
    </motion.section>
  );
}
