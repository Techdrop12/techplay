'use client'
import { useEffect, useState } from 'react'

export default function StickyFreeShippingBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 150)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return visible ? (
    <div className="fixed bottom-0 w-full bg-green-100 text-green-800 text-center py-2 text-sm z-50">
      📦 Livraison gratuite dès 50 €
    </div>
  ) : null
}
