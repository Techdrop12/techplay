'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/context/cartContext'
import SEOHead from '@/components/SEOHead'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { useRecommendations } from '@/hooks/useRecommendations' // Hook optionnel si tu veux custom

export default function PanierPage() {
  const t = useTranslations('cart')
  const { cart, total } = useCart()
  const router = useRouter()

  const FREE_SHIPPING_THRESHOLD = 60
  const progressPercent = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - total).toFixed(2)

  // Calcul catégorie pour recommandations
  const categoriesInCart = [...new Set(cart.map(p => p.category))]
  const categoryForRecs = categoriesInCart.length > 0 ? categoriesInCart[0] : null
  const excludeIds = cart.map(p => p._id)

  // Tu peux utiliser le hook useRecommendations si tu veux
  // const { recommendations, loading, error } = useRecommendations(categoryForRecs, excludeIds, 4)
  // Sinon tu peux utiliser UpsellContext directement

  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      })

      const data = await res.json()
      if (data.url) router.push(data.url)
    } catch (err) {
      alert(t('error'))
    }
  }

  return (
    <>
      <SEOHead
        titleKey="seo.cart_title"
        descriptionKey="seo.cart_description"
      />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('your_cart')}</h1>

        {cart.length === 0 ? (
          <p>{t('empty')}</p>
        ) : (
          <>
            {/* Barre de progression vers livraison gratuite */}
            <div className="mb-4">
              <p className="text-sm mb-1">
                {progressPercent >= 100
                  ? "✅ Livraison gratuite atteinte !"
                  : `Encore ${missing} € pour la livraison gratuite !`}
              </p>
              <div className="w-full h-3 bg-gray-200 rounded">
                <div
                  className="h-3 bg-green-500 rounded transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <ul className="divide-y border rounded mb-6">
              {cart.map((item, i) => (
                <li key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.price} € x {item.quantity}</p>
                  </div>
                  <p className="text-right font-medium">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </li>
              ))}
            </ul>

            <div className="text-right mb-6">
              <p className="text-lg font-bold">{t('total')}: {total.toFixed(2)} €</p>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-black text-white px-6 py-3 rounded hover:opacity-90 w-full"
            >
              {t('checkout')}
            </button>

            <Link
              href="/"
              className="block mt-4 text-sm text-center text-blue-600 underline"
            >
              {t('continue')}
            </Link>

            {/* Affichage Upsell / recommandations dynamiques */}
            <UpsellBlock />
          </>
        )}
      </div>
    </>
  )
}
