'use client'

import { useEffect, useState } from 'react'
import { getWishlist } from '@/lib/wishlist'
import ProductCard from '@/components/ProductCard'
import SEOHead from '@/components/SEOHead'
import { motion } from 'framer-motion'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    const saved = getWishlist()
    setWishlist(saved)
  }, [])

  useEffect(() => {
    if (wishlist.length === 0) return

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(p => wishlist.some(w => w._id === p._id))
        setProducts(filtered)
      })
      .catch(() => setProducts([]))
  }, [wishlist])

  return (
    <>
      <SEOHead
        overrideTitle="Ma Wishlist"
        overrideDescription="Retrouvez vos produits favoris sur TechPlay"
      />

      <div className="max-w-5xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ma Wishlist</h1>

        {products.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            Votre liste de souhaits est vide pour le moment.
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}
