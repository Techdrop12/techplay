
'use client'
import { useCart } from '@/context/cartContext'
import Image from 'next/image'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      {product.image && (
        <Image
          src={product.image}
          alt={product.title}
          width={300}
          height={200}
          className="object-cover rounded mb-2"
        />
      )}
      <h2 className="font-semibold text-lg mb-2">{product.title}</h2>
      <p className="text-sm text-gray-500 mb-2">{product.description}</p>
      <p className="font-bold mb-2">{product.price} €</p>
      <button
        onClick={() => addToCart(product)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Ajouter au panier
      </button>
    </div>
  )
}
