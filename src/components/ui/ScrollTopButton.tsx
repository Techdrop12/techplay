'use client'
import { useEffect, useState } from 'react'
import { scrollToTop } from '@/lib/scroll'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 bg-brand text-white px-3 py-2 rounded-full shadow-lg z-50"
      aria-label="Retour en haut"
    >
      ↑
    </button>
  )
}
