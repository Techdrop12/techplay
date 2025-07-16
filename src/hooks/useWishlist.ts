import { useEffect, useState } from 'react'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('wishlist')
    if (stored) {
      setWishlist(JSON.parse(stored))
    }
  }, [])

  return { wishlist }
}
