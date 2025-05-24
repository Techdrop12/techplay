'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { toast } from 'react-hot-toast'
import JsonLd from '@/components/JsonLd'
import RecentProducts from '@/components/RecentProducts'
import { addRecentProduct } from '@/lib/recentProducts'
import { getBreadcrumbJsonLd } from '@/lib/breadcrumbJsonLd'
import SEOHead from '@/components/SEOHead'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [variant, setVariant] = useState('A')
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Produit introuvable')
        return res.json()
      })
      .then(data => setProduct(data))
      .catch(() => toast.error('Erreur chargement produit'))
  }, [slug])

  useEffect(() => {
    setVariant(Math.random() < 0.5 ? 'A' : 'B')
  }, [])

  useEffect(() => {
    if (!product) return

    fetch(`/api/recommendations?category=${encodeURIComponent(product.category)}&excludeIds=${product._id}`)
      .then(res => {
        if (!res.ok) throw new Error('Erreur recommandations')
        return res.json()
      })
      .then(data => setRecommendations(data))
      .catch(() => toast.error('Erreur chargement recommandations'))

    addRecentProduct({
      slug: product.slug,
      name: product.title,
      price: product.price,
      image: product.image,
    })
  }, [product])

  if (!product) return <p>Chargement...</p>

  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || ''

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [product.image],
    "description": product.description,
    "sku": product._id.toString(),
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/produit/${product.slug}`,
      "priceCurrency": "EUR",
      "price": product.price.toFixed(2),
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  }

  const breadcrumb = getBreadcrumbJsonLd([
    { label: 'Accueil', url: 'https://techplay.com/' },
    { label: product.category, url: `https://techplay.com/categorie/${product.category}` },
    { label: product.title, url: `https://techplay.com/produit/${product.slug}` }
  ])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <SEOHead
        overrideTitle={product.title}
        product={product}
        image={product.image}
        url={`${baseUrl}/produit/${product.slug}`}
      />
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumb} />

      <h1 className="text-3xl font-bold mb-4">
        {variant === 'A' ? product.title : `${product.title} - Nouvelle version`}
      </h1>

      <ProductCard product={product} variant={variant} />

      {variant === 'B' && (
        <p className="mt-4 text-sm text-green-600 font-semibold">
          Offre spéciale variante B !
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

      <RecentProducts />
    </div>
  )
}
