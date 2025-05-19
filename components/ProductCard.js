'use client'
import React from 'react'
import { useCart } from '@/src/context/cartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} />
      <h3>{product.title}</h3>
      <p>{product.price} €</p>
      <button onClick={() => addToCart(product)}>Ajouter au panier</button>
    </div>
  )
}
