'use client'

import { useEffect, useState } from 'react'
import { scrollToTop } from '@/lib/scroll'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 300)
    window.addEventListener('scroll', handle, { passive: true })
    handle() // état initial
    return () => window.removeEventListener('scroll', handle)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={(e) => {
        e.currentTarget.blur()
        // @lib/scroll accepte des options => on passe 'smooth'
        scrollToTop({ behavior: 'smooth' })
      }}
      className="fixed bottom-4 right-4 bg-brand text-white px-3 py-2 rounded-full shadow-lg z-50
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label="Retour en haut"
    >
      ↑
    </button>
  )
}
