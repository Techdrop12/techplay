// src/components/ExitPopup.js
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ExitPopup() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId = null

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !shown) {
        const cart = localStorage.getItem('cart')
        if (cart && JSON.parse(cart).length > 0) {
          toast(
            'Vous avez des articles dans votre panier, ne les oubliez pas !',
            {
              duration: 8000,
              icon: '🛒',
              style: { background: '#000', color: '#fff' },
            }
          )
          setShown(true)
          window.removeEventListener('mouseout', handleMouseLeave)
          clearTimeout(timeoutId)
        }
      }
    }

    window.addEventListener('mouseout', handleMouseLeave)

    // Reset popup shown after 1h to allow new popup on next exit
    timeoutId = setTimeout(() => setShown(false), 1000 * 60 * 60)

    return () => {
      window.removeEventListener('mouseout', handleMouseLeave)
      clearTimeout(timeoutId)
    }
  }, [shown])

  return null
}
