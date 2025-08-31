'use client'

import {useTranslations} from 'next-intl'
import {useEffect, useMemo, useRef, useState} from 'react'
import {toast} from 'react-hot-toast'

import HeroCarousel from '@/components/HeroCarousel'
import ProductCard from '@/components/ProductCard'
import MotionWrapper from '@/components/MotionWrapper'
import type { Product } from '@/types/product'

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type ProductLike = Product & {
  tags?: string[]
}

type FetchState = ProductLike[] | null // null = loading, [] = vide

/* -------------------------------------------------------------------------- */
/*                              Category pill UI                              */
/* -------------------------------------------------------------------------- */

type CategoryPillProps = {
  label: string
  active: boolean
  onClick: () => void
}

function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={[
        'whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-[0.95rem] font-medium',
        'transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        active
          ? 'bg-accent text-white shadow'
          : 'bg-[hsl(var(--surface-2))] dark:bg-zinc-800/70 text-gray-800 dark:text-gray-100 hover:bg-[hsl(var(--surface-3))] dark:hover:bg-zinc-700'
      ].join(' ')}
    >
      {label}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Skeleton cards                               */
/* -------------------------------------------------------------------------- */

function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl h-64 bg-[linear-gradient(90deg,hsl(var(--surface-2))_25%,hsl(var(--surface))_37%,hsl(var(--surface-2))_63%)] bg-[length:400%_100%] animate-[shimmer_1.2s_infinite]"
        />
      ))}
    </div>
  )
}

/* ----------------------------- Empty state icon ---------------------------- */

const EmptyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5ZM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
  </svg>
)

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function HomeClient() {
  const tHome = useTranslations('home')

  const [products, setProducts] = useState<FetchState>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [displayCount, setDisplayCount] = useState<number>(12)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  /* ------------------------------- Fetch data ------------------------------ */
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' })
        if (!res.ok) throw new Error('API error')
        const data = (await res.json()) as ProductLike[]
        if (cancelled) return

        setProducts(data)

        const unique = Array.from(
          new Set(
            data.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []))
          )
        )
        setCategories(unique)
      } catch {
        if (!cancelled) {
          setProducts([])
          toast.error(tHome('error_loading_products'))
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [tHome])

  /* ------------------------------- Derived UI ------------------------------ */
  const filteredProducts: ProductLike[] = useMemo(() => {
    if (!products) return []
    if (selectedCategory === 'all') return products
    return products.filter((p) => p.tags?.includes(selectedCategory))
  }, [products, selectedCategory])

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, displayCount),
    [filteredProducts, displayCount]
  )

  /* ---------------------------- Infinite scroll ---------------------------- */
  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && displayCount < filteredProducts.length) {
          setDisplayCount((prev) => prev + 12)
        }
      },
      { rootMargin: '200px 0px 400px 0px', threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [displayCount, filteredProducts.length])

  /* ------------------------------ Loading state ---------------------------- */
  if (products === null) {
    return (
      <MotionWrapper>
        <HeroCarousel />
        <GridSkeleton />
      </MotionWrapper>
    )
  }

  /* --------------------------------- Render -------------------------------- */
  return (
    <MotionWrapper>
      {/* Hero */}
      <HeroCarousel />

      {/* Categories (pills) */}
      {categories.length > 1 && (
        <section
          className="mt-4 pb-1 px-4"
          aria-label={tHome('categories_section_label', { default: 'Catégories' })}
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            <CategoryPill
              label={tHome('all')}
              active={selectedCategory === 'all'}
              onClick={() => {
                setSelectedCategory('all')
                setDisplayCount(12)
              }}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setDisplayCount(12)
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Products grid */}
      <section className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div
            className="text-center text-gray-500 dark:text-gray-300 mt-10"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-[hsl(var(--surface-2))] dark:bg-zinc-800 grid place-items-center">
              <EmptyIcon />
            </div>
            <p>{tHome('no_products_available')}</p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-8" aria-hidden="true" />
      </section>
    </MotionWrapper>
  )
}

/* --------------------------------- Keyframes --------------------------------
   (si tu n’as pas ajouté le keyframe shimmer côté Tailwind, la classe ci-dessous
   garantit l’anim dans ce composant) */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      style: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>
    }
  }
}
