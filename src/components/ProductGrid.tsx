'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import ProductSkeleton from '@/components/ProductSkeleton'
import type { Product } from '@/types/product'
import { pushDataLayer } from '@/lib/ga'

type Cols = { base?: number; sm?: number; md?: number; lg?: number; xl?: number }

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  observeMore?: boolean
  loadingCount?: number
  showWishlistIcon?: boolean
  columns?: Cols
  className?: string
  listName?: string
  id?: string
}

function colsToClass(cols?: Cols) {
  const c = { base: 2, sm: 3, lg: 4, ...(cols || {}) }
  const parts: string[] = []
  if (c.base) parts.push(`grid-cols-${c.base}`)
  if (c.sm) parts.push(`sm:grid-cols-${c.sm}`)
  if (c.md) parts.push(`md:grid-cols-${c.md}`)
  if (c.lg) parts.push(`lg:grid-cols-${c.lg}`)
  if (c.xl) parts.push(`xl:grid-cols-${c.xl}`)
  return parts.join(' ')
}

export default function ProductGrid({
  products,
  emptyMessage,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  observeMore = true,
  loadingCount = 8,
  showWishlistIcon = false,
  columns,
  className = '',
  listName = 'product_grid',
  id,
}: ProductGridProps) {
  const prefersReducedMotion = useReducedMotion()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingGateRef = useRef(false)
  const statusRef = useRef<HTMLParagraphElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)

  // === Infinite scroll (sentinelle) ===
  useEffect(() => {
    if (!observeMore || !hasMore || !onLoadMore || !sentinelRef.current) return
    const el = sentinelRef.current

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting)
        if (!hit || loadingGateRef.current) return
        loadingGateRef.current = true
        try { onLoadMore() } finally {
          setTimeout(() => { loadingGateRef.current = false }, 500)
        }
      },
      { rootMargin: '200px 0px 400px 0px', threshold: 0.01 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [observeMore, hasMore, onLoadMore])

  // Réouvre la gate lorsque le chargement se termine
  useEffect(() => {
    if (!isLoading) loadingGateRef.current = false
  }, [isLoading])

  const isEmpty = useMemo(() => !products || products.length === 0, [products])

  // === Message de statut ARIA ===
  const countMsg = useMemo(() => {
    if (isLoading && products.length === 0) return 'Chargement des produits…'
    if (isEmpty) return emptyMessage || 'Aucun produit trouvé.'
    return `${products.length} produit${products.length > 1 ? 's' : ''} affiché${products.length > 1 ? 's' : ''}.`
  }, [isLoading, isEmpty, products.length, emptyMessage])

  // === JSON-LD ItemList (SEO) — URL corrigée vers /products/[slug] ===
  const itemListJsonLd = useMemo(() => {
    if (!products?.length) return null
    const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.slice(0, 12).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: p?.slug ? `${base}/products/${p.slug}` : `${base}/products`,
        name: p?.title || 'Produit',
      })),
    }
  }, [products])

  // === GA4/GTM: view_item_list + impressions au scroll ===
  const seenRef = useRef<Set<string>>(new Set())
  const batchRef = useRef<{ id: string; name: string; price?: number }[]>([])
  const flushTimeout = useRef<number | null>(null)

  const flushBatch = () => {
    if (!batchRef.current.length) return
    try {
      pushDataLayer({
        event: 'view_item_list',
        item_list_name: listName,
        items: batchRef.current.map((it) => ({
          item_id: it.id,
          item_name: it.name,
          price: it.price,
        })),
      })
    } catch {}
    batchRef.current = []
    if (flushTimeout.current) {
      window.clearTimeout(flushTimeout.current)
      flushTimeout.current = null
    }
  }

  useEffect(() => {
    seenRef.current.clear()
    batchRef.current = []
    if (!gridRef.current) return

    const nodes = Array.from(
      gridRef.current.querySelectorAll<HTMLElement>('[data-product-id]')
    )
    if (!nodes.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const id = e.target.getAttribute('data-product-id') || ''
          const name = e.target.getAttribute('aria-label')?.replace(/^Produit : /, '') || ''
          if (!id || seenRef.current.has(id)) return
          seenRef.current.add(id)
          const prod = products.find((p) => String(p._id) === id || p.slug === id)
          batchRef.current.push({ id, name, price: prod?.price })
        })
        if (!flushTimeout.current && batchRef.current.length) {
          flushTimeout.current = window.setTimeout(flushBatch, 250)
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px 100px 0px' }
    )

    nodes.forEach((n) => io.observe(n))
    return () => {
      io.disconnect()
      flushBatch()
    }
  }, [products, listName])

  if (isEmpty && !isLoading) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400" role="status">
        {emptyMessage || 'Aucun produit trouvé.'}
      </div>
    )
  }

  return (
    <>
      <p ref={statusRef} className="sr-only" role="status" aria-live="polite">
        {countMsg}
      </p>

      <AnimatePresence mode={prefersReducedMotion ? 'sync' : 'popLayout'}>
        <motion.div
          key="grid"
          ref={gridRef}
          layout={!prefersReducedMotion}
          className={`grid ${colsToClass(columns) || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-6 ${className}`}
          aria-live="polite"
          aria-busy={isLoading ? 'true' : 'false'}
          role="list"
          id={id}
        >
          {products.map((product, i) => (
            <motion.div key={String(product._id ?? product.slug ?? i)} layout={!prefersReducedMotion}>
              <ProductCard
                product={product}
                showWishlistIcon={showWishlistIcon}
                priority={i < 4}
              />
            </motion.div>
          ))}

          {isLoading &&
            Array.from({ length: loadingCount }).map((_, i) => (
              <div key={`skeleton-${i}`} aria-hidden="true">
                <ProductSkeleton />
              </div>
            ))}
        </motion.div>
      </AnimatePresence>

      {(hasMore || isLoading) && onLoadMore && (
        <div className="flex items-center justify-center mt-8">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-lg bg-accent text-white px-5 py-2 font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-60"
            aria-label="Charger plus de produits"
          >
            {isLoading ? 'Chargement…' : 'Charger plus'}
          </button>
        </div>
      )}

      {observeMore && hasMore && <div ref={sentinelRef} className="h-1" aria-hidden="true" />}

      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
    </>
  )
}
