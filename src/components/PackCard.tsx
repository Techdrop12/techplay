// src/components/PackCard.tsx — Ultra premium
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import type { Pack } from '@/types/product'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import { logEvent } from '@/lib/logEvent'
import { pushDataLayer } from '@/lib/ga'

interface PackCardProps {
  pack: Pack
  priority?: boolean
  className?: string
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function PackCard({ pack, priority = false, className }: PackCardProps) {
  // Champs sûrs du type Pack
  const {
    slug,
    title = 'Pack',
    description,
    image,
    price = 0,
    oldPrice,
  } = pack

  // Champs “étendus” optionnels
  const extra = pack as any
  const images: string[] | undefined = extra?.images
  const compareAtPrice: number | undefined =
    extra?.compareAtPrice ?? extra?.compare_at_price ?? extra?.referencePrice ?? extra?.reference_price
  const isNew: boolean | undefined = extra?.isNew ?? extra?.new
  const isBestSeller: boolean | undefined = extra?.isBestSeller ?? extra?.bestSeller ?? extra?.bestseller
  const stock: number | undefined = typeof extra?.stock === 'number' ? extra.stock : undefined
  const items: any[] | undefined = Array.isArray(extra?.items) ? extra.items : Array.isArray(extra?.contents) ? extra.contents : undefined
  const rating: number | undefined = typeof extra?.rating === 'number' ? extra.rating : undefined

  const prefersReducedMotion = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Image principale
  const mainImage = useMemo(() => {
    const first = Array.isArray(images) && images.length ? images[0] : image
    return imgError ? '/placeholder.png' : (first || '/placeholder.png')
  }, [images, image, imgError])

  // Prix de référence & remises
  const refPrice = typeof oldPrice === 'number' && oldPrice > price ? oldPrice
    : (typeof compareAtPrice === 'number' && compareAtPrice > price ? compareAtPrice : undefined)

  const discountPct = useMemo(() => (typeof refPrice === 'number'
    ? Math.round(((refPrice - price) / refPrice) * 100)
    : null), [refPrice, price])

  const savingsEuro = useMemo(() => (typeof refPrice === 'number' ? Math.max(0, refPrice - price) : null), [refPrice, price])

  const packUrl = slug ? `/pack/${slug}` : '#'
  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5

  // Tilt 3D
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 })
  const ticking = useRef(false)
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const ry = clamp((dx / (r.width / 2)) * 6, -8, 8)
    const rx = clamp((-dy / (r.height / 2)) * 6, -8, 8)
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      setTilt({ rx, ry })
      ticking.current = false
    })
  }
  const resetTilt = () => setTilt({ rx: 0, ry: 0 })

  // Tracking
  const cardRef = useRef<HTMLDivElement | null>(null)
  const viewedRef = useRef(false)

  useEffect(() => {
    if (!cardRef.current || viewedRef.current) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !viewedRef.current) {
          viewedRef.current = true
          try { logEvent({ action: 'pack_card_view', category: 'engagement', label: title, value: price }) } catch {}
          try { pushDataLayer({ event: 'view_pack_card', items: [{ item_id: slug, item_name: title, price }] }) } catch {}
        }
      }
    }, { threshold: 0.35 })
    io.observe(cardRef.current)
    return () => io.disconnect()
  }, [slug, title, price])

  const handleClick = useCallback(() => {
    try { logEvent({ action: 'pack_card_click', category: 'engagement', label: title, value: price }) } catch {}
    try { pushDataLayer({ event: 'select_pack', items: [{ item_id: slug, item_name: title, price }] }) } catch {}
  }, [slug, title, price])

  return (
    <motion.article
      ref={cardRef}
      role="listitem"
      aria-label={`Pack : ${title}`}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-[1px]',
        'ring-conic',
        'shadow-sm hover:shadow-2xl transition-shadow',
        className
      )}
      style={{ perspective: 1000 }}
      whileHover={!prefersReducedMotion ? { scale: 1.015 } : undefined}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      data-pack-id={slug}
      tabIndex={0}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={mainImage} />
      {slug && <meta itemProp="url" content={packUrl} />}

      <motion.div
        className={cn(
          'relative overflow-hidden rounded-[inherit]',
          'bg-white/80 dark:bg-zinc-900/80 supports-[backdrop-filter]:backdrop-blur',
          'border border-white/40 dark:border-white/10 ring-1 ring-gray-200/60 dark:ring-gray-800/60'
        )}
        style={
          !prefersReducedMotion
            ? { rotateX: tilt.rx, rotateY: tilt.ry, transformStyle: 'preserve-3d' as const }
            : {}
        }
      >
        {/* Shine */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: 'radial-gradient(700px 220px at 12% -10%, rgba(255,255,255,0.35), transparent 60%)' }}
        />

        <Link
          href={packUrl}
          prefetch
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.60)]"
          aria-label={`Voir le pack : ${title}`}
          onClick={handleClick}
        >
          {/* Media */}
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-zinc-800 sm:aspect-[16/9]">
            <Image
              src={mainImage}
              alt={`Image du pack ${title}`}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
              priority={priority}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={85}
              onLoadingComplete={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              decoding="async"
              draggable={false}
            />

            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/70 to-gray-100/40 dark:from-zinc-800/60 dark:to-zinc-900/40" aria-hidden />
            )}

            {/* Badges */}
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex select-none flex-col gap-2">
              {isNew && <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">Nouveau</span>}
              {isBestSeller && <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow">Best Seller</span>}
              {typeof discountPct === 'number' && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow" aria-label={`${discountPct}% d’économie`}>
                  -{discountPct}%
                </span>
              )}
              {lowStock && <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow">Stock faible</span>}
            </div>

            {/* Rating si dispo */}
            {hasRating && (
              <div className="absolute right-3 top-3 rounded-full border border-gray-200/60 bg-white/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90" aria-label={`Note moyenne : ${rating!.toFixed(1)} étoiles`}>
                <span className="text-yellow-500">★</span> {rating!.toFixed(1)}
              </div>
            )}

            {/* Rupture */}
            {typeof stock === 'number' && stock <= 0 && (
              <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white" aria-hidden>
                Rupture
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" aria-hidden />
          </div>

          {/* Contenu */}
          <div className="p-5 sm:p-6">
            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl" title={title}>
              {title}
            </h3>

            {Array.isArray(items) && items.length > 0 && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {items.length} article{items.length > 1 ? 's' : ''} inclus
              </p>
            )}

            {description && (
              <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-4" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span className="text-lg font-extrabold text-brand sm:text-xl" aria-label={`Prix : ${formatPrice(price)}`}>
                <meta itemProp="priceCurrency" content="EUR" />
                <meta itemProp="price" content={Math.max(0, Number(price || 0)).toFixed(2)} />
                {formatPrice(price)}
              </span>

              {typeof refPrice === 'number' && refPrice > price && (
                <>
                  <span className="text-sm text-gray-400 line-through dark:text-gray-500" aria-label="Prix de référence">
                    {formatPrice(refPrice)}
                  </span>
                  {typeof discountPct === 'number' && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">–{discountPct}%</span>
                  )}
                </>
              )}
            </div>

            {typeof savingsEuro === 'number' && savingsEuro > 0 && (
              <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Vous économisez {formatPrice(savingsEuro)}
              </p>
            )}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>
      </motion.div>
    </motion.article>
  )
}
