import { useEffect, useState } from 'react'

export function useCart() {
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      setCart(JSON.parse(stored))
    }
  }, [])

  return { cart }
}
