'use client'

import { useEffect } from 'react'

export default function ExitPopup() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleBeforeUnload = (e) => {
        const cart = localStorage.getItem('cart')
        if (cart && JSON.parse(cart).length > 0) {
          e.preventDefault()
          e.returnValue = ''
        }
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
