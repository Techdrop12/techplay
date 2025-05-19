'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCart } from 'context/cartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center gap-2 shadow hover:shadow-lg transition">
      <Link href={`/product/${product._id}`}>
        <img src={product.image} alt={product.title} className="h-48 w-full object-cover cursor-pointer" />
      </Link>
      <h3 className="text-lg font-semibold">{product.title}</h3>
      <p className="text-gray-500">{product.description?.substring(0, 50)}...</p>
      <div className="flex justify-between items-center w-full">
        <span className="text-green-600 font-bold">{product.price}€</span>
        <button
          className="p-2 bg-black text-white rounded-full hover:bg-gray-800"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart size={20} />
        </button>
      </div>
    </div>
  )
}
