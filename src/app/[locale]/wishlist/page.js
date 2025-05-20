'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function WishlistPage() {
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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ma liste de souhaits</h1>
      {products.length === 0 ? (
        <p>Aucun produit dans votre wishlist.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(product => (
            <li key={product._id} className="border p-4 rounded">
              <h2 className="font-semibold">{product.title}</h2>
              <p className="text-sm">{product.price} €</p>
              <Link href={`/produit/${product.slug}`} className="text-blue-500 text-sm underline">
                Voir le produit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
