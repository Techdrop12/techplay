// src/components/PackCard.tsx — ULTIME++ (futuriste, a11y/SEO/UX/Perf max)
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
  // Champs sûrs
  const {
    slug,
    title = 'Pack',
    description,
    image,
    price = 0,
    oldPrice,
  } = pack

  // Champs étendus (robustes à tous les shapes)
  const x = pack as any
  const images: string[] | undefined = Array.isArray(x.images) ? x.images : undefined
  const compareAtPrice: number | undefined =
    typeof x.compareAtPrice === 'number' ? x.compareAtPrice
    : typeof x.compare_at_price === 'number' ? x.compare_at_price
    : typeof x.referencePrice === 'number' ? x.referencePrice
    : typeof x.reference_price === 'number' ? x.reference_price
    : undefined

  const isNew: boolean | undefined = typeof x.isNew === 'boolean' ? x.isNew : x.new
  const isBestSeller: boolean | undefined = typeof x.isBestSeller === 'boolean' ? x.isBestSeller : (x.bestSeller || x.bestseller)
  const stock: number | undefined = typeof x.stock === 'number' ? x.stock : undefined
  const items: any[] = Array.isArray(x.items) ? x.items : Array.isArray(x.contents) ? x.contents : []
  const rating: number | undefined = typeof x.rating === 'number' ? x.rating : undefined
  const reviewsCount: number | undefined = typeof x.reviewsCount === 'number' ? x.reviewsCount : (typeof x.reviews === 'number' ? x.reviews : undefined)
  const sku: string | undefined = typeof x.sku === 'string' ? x.sku : (x.id ? String(x.id) : undefined)
  const brand: string | undefined = typeof x.brand === 'string' ? x.brand : undefined

  const prefersReducedMotion = useReducedMotion()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Image principale
  const mainImage = useMemo(() => {
    const first = Array.isArray(images) && images.length ? images[0] : image
    return imgError ? '/placeholder.png' : (first || '/placeholder.png')
  }, [images, image, imgError])

  // Valeur des items (somme) → économie en €
  const itemsValue = useMemo(() => {
    try {
      if (!Array.isArray(items) || items.length === 0) return undefined
      let sum = 0
      for (const it of items) {
        const v = (it && (it.price ?? it.prix ?? it.amount)) as number | string | undefined
        const n = typeof v === 'number' ? v : Number(v)
        if (Number.isFinite(n)) sum += n as number
      }
      return sum > 0 ? sum : undefined
    } catch {
      return undefined
    }
  }, [items])

  // Prix de référence
  const refPrice = typeof oldPrice === 'number' && oldPrice > price
    ? oldPrice
    : (typeof compareAtPrice === 'number' && compareAtPrice > price ? compareAtPrice : (itemsValue && itemsValue > price ? itemsValue : undefined))

  const discountPct = useMemo(() => (typeof refPrice === 'number'
    ? Math.round(((refPrice - price) / refPrice) * 100)
    : null), [refPrice, price])

  const savingsEuro = useMemo(() => (typeof refPrice === 'number' ? Math.max(0, refPrice - price) : null), [refPrice, price])

  const packUrl = slug ? '/pack/' + slug : '#'
  const hasRating = typeof rating === 'number' && !Number.isNaN(rating)
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 5
  const outOfStock = typeof stock === 'number' && stock <= 0

  // Tilt 3D
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 })
  const ticking = useRef(false)
  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    try {
      // skip devices sans hover
      if (window.matchMedia && !window.matchMedia('(hover:hover)').matches) return
    } catch {}
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

  // Tracking impressions (IO)
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

  const handleClick = useCallback((e?: React.MouseEvent) => {
    if (!slug) {
      // Pas de slug : empêcher la nav tout en gardant le focus visuel
      if (e) e.preventDefault()
      return
    }
    try { logEvent({ action: 'pack_card_click', category: 'engagement', label: title, value: price }) } catch {}
    try { pushDataLayer({ event: 'select_pack', items: [{ item_id: slug, item_name: title, price }] }) } catch {}
  }, [slug, title, price])

  // A11y helpers
  const srId = useRef('sr-' + Math.random().toString(36).slice(2)).current
  const describe: string[] = []
  if (typeof discountPct === 'number') describe.push('Économie ' + discountPct + '%')
  if (lowStock) describe.push('Stock faible')
  if (outOfStock) describe.push('Rupture')
  const ariaDescribedBy = describe.length ? srId : undefined

  // Chips d’items (jusqu’à 3)
  const itemChips: string[] = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return []
    const labels: string[] = []
    for (const it of items) {
      const name = (it && (it.title || it.name || it.label)) as string | undefined
      if (typeof name === 'string' && name.trim()) labels.push(name.trim())
      if (labels.length >= 3) break
    }
    return labels
  }, [items])

  // Style conique piloté par économie %
  const conicPercent = typeof discountPct === 'number' ? Math.max(8, Math.min(100, discountPct)) : 0

  return (
    <motion.article
      ref={cardRef}
      role="listitem"
      aria-label={'Pack : ' + title}
      aria-describedby={ariaDescribedBy}
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group relative rounded-3xl p-[1px]',
        'ring-conic',
        'shadow-sm hover:shadow-2xl transition-shadow',
        className
      )}
      style={
        !prefersReducedMotion
          ? { perspective: 1000, ['--ring-progress' as any]: String(conicPercent) }
          : { perspective: 1000 }
      }
      whileHover={!prefersReducedMotion ? { scale: 1.015 } : undefined}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: 'easeOut' }}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      data-pack-id={slug}
      tabIndex={0}
    >
      <meta itemProp="name" content={title} />
      <meta itemProp="image" content={mainImage} />
      {slug && <meta itemProp="url" content={packUrl} />}
      {brand && <meta itemProp="brand" content={brand} />}
      {sku && <meta itemProp="sku" content={sku} />}

      {/* AggregateRating microdata */}
      {hasRating && (
        <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" className="hidden">
          <meta itemProp="ratingValue" content={rating!.toFixed(1)} />
          {typeof reviewsCount === 'number' && <meta itemProp="reviewCount" content={String(Math.max(0, reviewsCount))} />}
        </div>
      )}

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

        {/* Media + header badges */}
        <Link
          href={packUrl}
          prefetch
          className="block rounded-[inherit] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.60)]"
          aria-label={'Voir le pack : ' + title}
          onClick={handleClick}
        >
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-zinc-800 sm:aspect-[16/9]">
            <Image
              src={mainImage}
              alt={'Image du pack ' + title}
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
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow" aria-label={String(discountPct) + '% d’économie'}>
                  {'-' + discountPct + '%'}
                </span>
              )}
              {lowStock && <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 shadow">Stock faible</span>}
            </div>

            {/* Rating */}
            {hasRating && (
              <div className="absolute right-3 top-3 rounded-full border border-gray-200/60 bg-white/90 px-2.5 py-1 text-xs shadow backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90" aria-label={'Note moyenne : ' + rating!.toFixed(1) + ' étoiles'}>
                <span className="text-yellow-500">★</span> {rating!.toFixed(1)}
              </div>
            )}

            {/* Rupture */}
            {outOfStock && (
              <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white" aria-hidden>
                Rupture
              </div>
            )}

            {/* Gradient bas */}
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

            {/* Chips des 3 premiers items */}
            {itemChips.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Aperçu des articles">
                {itemChips.map((n, i) => (
                  <li key={i} className="rounded-md border border-token-border bg-token-surface px-2 py-1 text-[11px] text-token-text/80">
                    {n}
                  </li>
                ))}
              </ul>
            )}

            {description && (
              <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}

            {/* Pricing + microdata Offer */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-4" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="itemCondition" content="https://schema.org/NewCondition" />
              <link itemProp="availability" href={outOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'} />
              <meta itemProp="price" content={Math.max(0, Number(price || 0)).toFixed(2)} />

              <span className="text-lg font-extrabold text-brand sm:text-xl" aria-label={'Prix : ' + formatPrice(price)}>
                {formatPrice(price)}
              </span>

              {typeof refPrice === 'number' && refPrice > price && (
                <>
                  <span className="text-sm text-gray-400 line-through dark:text-gray-500" aria-label="Prix de référence">
                    {formatPrice(refPrice)}
                  </span>
                  {typeof discountPct === 'number' && (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{'-' + discountPct + '%'}</span>
                  )}
                </>
              )}
            </div>

            {/* Économie & Valeur des articles */}
            {typeof savingsEuro === 'number' && savingsEuro > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Vous économisez {formatPrice(savingsEuro)}
                </p>
                {typeof itemsValue === 'number' && (
                  <span className="text-token-text/60">
                    Valeur des articles : {formatPrice(itemsValue)}
                  </span>
                )}
              </div>
            )}

            <FreeShippingBadge price={price} minimal className="mt-2" />
          </div>
        </Link>
      </motion.div>

      {/* SR announce attaché si nécessaire */}
      {ariaDescribedBy && (
        <p id={srId} className="sr-only" aria-live="polite">
          {describe.join('. ')}
        </p>
      )}
    </motion.article>
  )
}
