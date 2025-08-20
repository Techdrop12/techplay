// src/components/ProductCard.tsx
'use client';

import { useEffect, useMemo, useRef, useState, MouseEvent, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import WishlistButton from '@/components/WishlistButton';
import FreeShippingBadge from '@/components/FreeShippingBadge';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/types/product';
import { logEvent } from '@/lib/logEvent';

interface ProductCardProps {
  product: Product;
  /** Priorise le chargement de l’image (LCP) */
  priority?: boolean;
  /** Afficher le bouton wishlist */
  showWishlistIcon?: boolean;
  /** Afficher le CTA “Ajouter au panier” */
  showAddToCart?: boolean;
  /** Classe(s) personnalisée(s) */
  className?: string;
}

/** Clamp helper */
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function ProductCard({
  product,
  priority = false,
  showWishlistIcon = false,
  showAddToCart = true,
  className,
}: ProductCardProps) {
  const {
    _id = '',
    slug,
    title = 'Produit',
    price = 0,
    oldPrice,
    image = '/placeholder.png',
    rating,
    isNew,
    isBestSeller,
    // facultatif si défini dans Product
    stock,
  } = product ?? {};

  const prefersReducedMotion = useReducedMotion();

  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const viewedRef = useRef(false);

  // Tilt state + rAF throttle
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const ticking = useRef(false);

  const discount = useMemo(
    () =>
      typeof oldPrice === 'number' && oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : null,
    [oldPrice, price]
  );

  // 🔎 Log “vue carte” une seule fois quand visible à l’écran
  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return;
    const el = cardRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !viewedRef.current) {
            viewedRef.current = true;
            try {
              logEvent({
                action: 'product_card_view',
                category: 'engagement',
                label: title,
                value: price,
              });
            } catch {}
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [title, price]);

  const handleClick = useCallback(() => {
    try {
      logEvent({
        action: 'product_card_click',
        category: 'engagement',
        label: title,
        value: price,
      });
    } catch {}
  }, [title, price]);

  const productUrl = useMemo(() => (slug ? `/produit/${slug}` : '#'), [slug]);
  const imgSrc = imgError ? '/placeholder.png' : image;
  const hasRating = typeof rating === 'number' && !Number.isNaN(rating);
  const priceContent = useMemo(() => Math.max(0, Number(price || 0)).toFixed(2), [price]);

  // Tilt 3D doux au survol (throttlé via rAF)
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    // évite de calculer si l’appareil ne supporte pas le hover
    if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return;

    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const ry = clamp((dx / (r.width / 2)) * 6, -8, 8); // rotateY
    const rx = clamp((-dy / (r.height / 2)) * 6, -8, 8); // rotateX

    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      setTilt({ rx, ry });
      ticking.current = false;
    });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const availability =
    typeof stock === 'number' ? (stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock') : undefined;

  return (
    <motion.article
      ref={cardRef}
      role="listitem"
      aria-label={`Produit : ${title}`}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-px bg-gradient-to-br from-accent/25 via-transparent to-transparent',
        'shadow-sm hover:shadow-xl transition-shadow',
        className
      )}
      style={{ perspective: 1000 }}
      whileHover={!prefersReducedMotion ? { scale: 1.015 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      data-product-id={_id}
      data-product-slug={slug}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={imgSrc} />
      {slug && <meta itemProp="url" content={productUrl} />}

      <motion.div
        className={cn(
          'relative rounded-[inherit] overflow-hidden',
          'bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800'
        )}
        style={
          !prefersReducedMotion
            ? { rotateX: tilt.rx, rotateY: tilt.ry, transformStyle: 'preserve-3d' as const }
            : {}
        }
      >
        {/* --- Zone cliquable (image + texte) --- */}
        <Link
          href={productUrl}
          prefetch={false}
          className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/60 rounded-[inherit]"
          aria-label={`Voir la fiche produit : ${title}`}
          onClick={handleClick}
        >
          {/* Image */}
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-zinc-800" aria-busy={!imgLoaded}>
            <Image
              src={imgSrc}
              alt={`Image du produit ${title}`}
              fill
              sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 100vw"
              className={cn(
                'object-cover transition-transform duration-700 will-change-transform',
                'group-hover:scale-105'
              )}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL="/placeholder-blur.png"
              onError={() => setImgError(true)}
              onLoadingComplete={() => setImgLoaded(true)}
              decoding="async"
              draggable={false}
            />

            {/* skeleton / shimmer tant que l’image n’est pas prête */}
            {!imgLoaded && (
              <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40"
                aria-hidden="true"
              />
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 select-none pointer-events-none">
              {isNew && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-green-600 shadow">
                  Nouveau
                </span>
              )}
              {isBestSeller && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-black bg-yellow-400 shadow">
                  Best Seller
                </span>
              )}
              {discount && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white bg-red-600 shadow"
                  aria-label={`${discount}% de réduction`}
                >
                  -{discount}%
                </span>
              )}
            </div>

            {/* Note */}
            {hasRating && (
              <div
                className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 border border-gray-200/60 dark:border-zinc-800 text-xs px-2.5 py-1 rounded-full shadow backdrop-blur-sm"
                aria-label={`Note moyenne : ${rating!.toFixed(1)} étoiles`}
              >
                <span className="text-yellow-500">★</span> {rating!.toFixed(1)}
              </div>
            )}

            {/* Vignette subtile bas */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
          </div>

          {/* Contenu */}
          <div className="p-4 sm:p-5">
            <h3 className="font-semibold text-base sm:text-lg line-clamp-2 text-gray-900 dark:text-white" title={title}>
              {title}
            </h3>

            <div
              className="mt-2 sm:mt-3 flex items-center gap-3"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <span
                className="text-brand font-extrabold text-lg sm:text-xl"
                aria-label={`Prix : ${formatPrice(price)}`}
              >
                <meta itemProp="priceCurrency" content="EUR" />
                <meta itemProp="price" content={priceContent} />
                {availability && <meta itemProp="availability" content={availability} />}
                {formatPrice(price)}
              </span>
              {typeof oldPrice === 'number' && oldPrice > price && (
                <span className="line-through text-sm text-gray-400 dark:text-gray-500" aria-label="Ancien prix">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>

            {/* AggregateRating (optionnel pour SEO) */}
            {hasRating && (
              <span
                itemProp="aggregateRating"
                itemScope
                itemType="https://schema.org/AggregateRating"
                className="sr-only"
              >
                <meta itemProp="ratingValue" content={rating!.toFixed(1)} />
                {/* si tu as le vrai nombre d’avis, remplace 12 */}
                <meta itemProp="reviewCount" content="12" />
              </span>
            )}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>

        {/* Actions flottantes (hors du <Link>) */}
        {showWishlistIcon && (
          <div className="absolute bottom-4 right-4 z-20">
            <WishlistButton
              product={{ _id, slug: slug ?? '', title, price, image }}
              aria-label={`Ajouter ${title} à la liste de souhaits`}
            />
          </div>
        )}

        {showAddToCart && (
          <div className="absolute bottom-4 left-4 z-20">
            <AddToCartButton
              product={{ _id, slug: slug ?? '', title, price, image }}
              size="sm"
              aria-label={`Ajouter ${title} au panier`}
            />
          </div>
        )}
      </motion.div>
    </motion.article>
  );
}
