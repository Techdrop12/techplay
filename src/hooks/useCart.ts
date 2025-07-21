import { useEffect, useState } from 'react'
import { getCart, saveCart } from '@/lib/cart'

interface CartItem {
  _id: string
  slug: string
  title: string
  image: string
  price: number
  quantity: number
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart(getCart())
  }, [])

  const addToCart = (item: CartItem) => {
    const updated = [...cart, item]
    setCart(updated)
    saveCart(updated)
  }

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item._id !== id)
    setCart(updated)
    saveCart(updated)
  }

  return { cart, addToCart, removeFromCart }
}
