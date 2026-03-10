'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { Product } from '@/types/product'

import ProductCard from '@/components/ProductCard'
import ProductSkeleton from '@/components/ProductSkeleton'
import { pushDataLayer } from '@/lib/ga'

type Cols = { base?: number; sm?: number; md?: number; lg?: number; xl?: number }

export interface Props {
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
  showWishlistIcon: _showWishlistIcon = false,
  columns,
  className = '',
  listName = 'product_grid',
  id,
}: Props) {
  const prefersReducedMotion = useReducedMotion()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingGateRef = useRef(false)
  const statusRef = useRef<HTMLParagraphElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const prevLenRef = useRef<number>(0)

  const isEmpty = useMemo(() => !products || products.length === 0, [products])

  const countMsg = useMemo(() => {
    if (isLoading && products.length === 0) return 'Chargement des produits…'
    if (isEmpty) return emptyMessage || 'Aucun produit trouvé.'
    return `${products.length} produit${products.length > 1 ? 's' : ''} affiché${products.length > 1 ? 's' : ''}.`
  }, [isLoading, isEmpty, products.length, emptyMessage])

  useEffect(() => {
    if (!observeMore || !hasMore || !onLoadMore || !sentinelRef.current) return

    const el = sentinelRef.current
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting)
        if (!hit || loadingGateRef.current) return

        loadingGateRef.current = true

        try {
          onLoadMore()
        } finally {
          window.setTimeout(() => {
            loadingGateRef.current = false
          }, 500)
        }
      },
      { rootMargin: '200px 0px 400px 0px', threshold: 0.01 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [observeMore, hasMore, onLoadMore])

  useEffect(() => {
    if (!isLoading) loadingGateRef.current = false
  }, [isLoading])

  useEffect(() => {
    const prev = prevLenRef.current
    const curr = products?.length ?? 0

    if (curr > prev && prev > 0 && statusRef.current) {
      const diff = curr - prev
      statusRef.current.textContent = `${diff} produit${diff > 1 ? 's' : ''} ajouté${diff > 1 ? 's' : ''}.`
    } else if (prev === 0 && curr > 0 && statusRef.current) {
      statusRef.current.textContent = countMsg
    }

    prevLenRef.current = curr
  }, [products, countMsg])

  const itemListJsonLd = useMemo(() => {
    if (!products?.length) return null

    const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com').replace(/\/+$/, '')

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.slice(0, 12).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: product?.slug ? `${base}/products/${product.slug}` : `${base}/products`,
        name: product?.title || 'Produit',
      })),
    }
  }, [products])

  const seenRef = useRef<Set<string>>(new Set())
  const batchRef = useRef<{ id: string; name: string; price?: number }[]>([])
  const flushTimeoutRef = useRef<number | null>(null)

  const flushBatch = useCallback(() => {
    if (!batchRef.current.length) return

    try {
      pushDataLayer({
        event: 'view_item_list',
        item_list_name: listName,
        items: batchRef.current.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
        })),
      })
    } catch {}

    batchRef.current = []

    if (flushTimeoutRef.current) {
      window.clearTimeout(flushTimeoutRef.current)
      flushTimeoutRef.current = null
    }
  }, [listName])

  useEffect(() => {
    seenRef.current.clear()
    batchRef.current = []

    if (!gridRef.current) return

    const nodes = Array.from(gridRef.current.querySelectorAll<HTMLElement>('[data-product-id]'))
    if (!nodes.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return

          const productId = entry.target.getAttribute('data-product-id') || ''
          const name = entry.target.getAttribute('aria-label')?.replace(/^Produit : /, '') || ''

          if (!productId || seenRef.current.has(productId)) return

          seenRef.current.add(productId)

          const product = products.find((p) => String(p._id) === productId || p.slug === productId)
          batchRef.current.push({ id: productId, name, price: product?.price })
        })

        if (!flushTimeoutRef.current && batchRef.current.length) {
          flushTimeoutRef.current = window.setTimeout(flushBatch, 250)
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px 100px 0px' }
    )

    nodes.forEach((node) => io.observe(node))

    return () => {
      io.disconnect()
      flushBatch()
    }
  }, [products, flushBatch])

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
          {products.map((product, index) => (
            <motion.div
              key={String(product._id ?? product.slug ?? index)}
              layout={!prefersReducedMotion}
              role="listitem"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}

          {isLoading &&
            Array.from({ length: loadingCount }).map((_, index) => (
              <div key={`skeleton-${index}`} aria-hidden="true">
                <ProductSkeleton />
              </div>
            ))}
        </motion.div>
      </AnimatePresence>

      {(hasMore || isLoading) && onLoadMore && (
        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-lg bg-accent px-5 py-2 font-semibold text-white shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-60"
            aria-label="Charger plus de produits"
            data-gtm="grid_load_more"
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