import { useEffect, useState } from 'react'
import { getCart, saveCart } from '@/lib/cart'

export function useCart() {
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    setCart(getCart())
  }, [])

  const addToCart = (item: any) => {
    const updated = [...cart, item]
    setCart(updated)
    saveCart(updated)
  }

  return { cart, addToCart }
}
