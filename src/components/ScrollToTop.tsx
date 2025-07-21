'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={(e) =>
        (e.key === 'Enter' || e.key === ' ') && scrollToTop()
      }
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-brand text-white shadow-lg hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition"
      aria-label="Remonter en haut"
      title="Remonter en haut"
      role="button"
      tabIndex={0}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
