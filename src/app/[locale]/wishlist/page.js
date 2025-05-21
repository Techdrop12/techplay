'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import SEOHead from '@/components/SEOHead'
import LocalizedLink from '@/components/LocalizedLink'

export default function WishlistPage() {
  const t = useTranslations('wishlist')
  const [wishlist, setWishlist] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
    setWishlist(saved)
  }, [])

  useEffect(() => {
    if (wishlist.length === 0) return
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(p => wishlist.includes(p._id))
        setProducts(filtered)
      })
  }, [wishlist])

  return (
    <>
      <SEOHead
        titleKey="seo.wishlist_title"
        descriptionKey="seo.wishlist_description"
      />

      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>

        {products.length === 0 ? (
          <p>{t('empty')}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <li key={product._id} className="border p-4 rounded">
                <h2 className="font-semibold">{product.title}</h2>
                <p className="text-sm">{product.price} €</p>
                <LocalizedLink
                  href={`/produit/${product.slug}`}
                  className="text-blue-500 text-sm underline"
                >
                  {t('view')}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
