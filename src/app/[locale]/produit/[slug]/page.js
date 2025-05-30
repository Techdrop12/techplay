'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

import ProductJsonLd from '@/components/ProductJsonLd'
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd'
import RecentProducts from '@/components/RecentProducts'
import ReviewForm from '@/components/ReviewForm'
import SEOHead from '@/components/SEOHead'
import ScoreTracker from '@/components/ScoreTracker'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import { addRecentProduct } from '@/lib/recentProducts'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [variant, setVariant] = useState('A')
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    setVariant(Math.random() < 0.5 ? 'A' : 'B')
  }, [])

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Produit introuvable')
        return res.json()
      })
      .then(setProduct)
      .catch(() => toast.error('Erreur lors du chargement du produit'))
  }, [slug])

  useEffect(() => {
    if (!product) return

    fetch(`/api/recommendations?category=${encodeURIComponent(product.category)}&excludeIds=${product._id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur recommandations')
        return res.json()
      })
      .then(setRecommendations)
      .catch(() => toast.error('Erreur chargement recommandations'))

    addRecentProduct({
      slug: product.slug,
      name: product.title,
      price: product.price,
      image: product.image,
    })
  }, [product])

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-gray-500 animate-pulse">
        Chargement du produit en cours...
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-6"
    >
      <ScoreTracker />

      <SEOHead
        overrideTitle={product.title}
        product={product}
        image={product.image}
        url={`${baseUrl}/produit/${product.slug}`}
      />
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        pathSegments={[
          { label: 'Accueil', url: `${baseUrl}/` },
          { label: product.category, url: `${baseUrl}/categorie/${product.category}` },
          { label: product.title, url: `${baseUrl}/produit/${product.slug}` }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4">
        {variant === 'A' ? product.title : `${product.title} - Édition Limitée`}
      </h1>

      <ProductCard product={product} variant={variant} />
      <FreeShippingBadge price={product.price} />

      {variant === 'B' && (
        <p className="mt-4 text-sm text-green-600 font-semibold">
          🎁 Offre spéciale sur cette version !
        </p>
      )}

      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Produits recommandés</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map(rec => (
              <ProductCard key={rec._id} product={rec} />
            ))}
          </div>
        </section>
      )}

      <ReviewForm slug={slug} />
      <RecentProducts />
    </motion.div>
  )
}
