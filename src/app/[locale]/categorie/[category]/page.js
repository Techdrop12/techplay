'use client'

import SEOHead from '@/components/SEOHead'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useRef } from 'react'
import ProductCard from '@/components/ProductCard'
import MotionWrapper from '@/components/MotionWrapper'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function CategoryPage() {
  const { category } = useParams()
  const t = useTranslations('category')
  const [products, setProducts] = useState([])
  const [displayCount, setDisplayCount] = useState(12)
  const sentinelRef = useRef(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/categories/${category}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setProducts(data)
      } catch {
        toast.error("Erreur lors du chargement des produits")
      }
    }

    fetchProducts()
  }, [category])

  const visibleProducts = products.slice(0, displayCount)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayCount < products.length) {
        setDisplayCount((prev) => prev + 12)
      }
    })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [displayCount, products])

  return (
    <>
      <SEOHead
        title={`Catégorie : ${category}`}
        description={`Tous les produits dans la catégorie ${category}`}
      />

      <MotionWrapper>
        <h1 className="text-xl font-bold px-4 mt-6 mb-4 capitalize">
          {t('title', { category })}
        </h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            Aucun produit trouvé pour cette catégorie.
          </p>
        )}

        <div ref={sentinelRef} className="h-8" />
      </MotionWrapper>
    </>
  )
}
