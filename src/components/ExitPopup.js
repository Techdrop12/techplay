'use client'

import { useEffect } from 'react'

export default function ExitPopup() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = (e) => {
      try {
        const cart = window.localStorage.getItem('cart')
        if (cart && JSON.parse(cart).length > 0) {
          e.preventDefault()
          e.returnValue = ''
        }
      } catch (error) {
        console.warn('Erreur ExitPopup (localStorage) :', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return null
}
