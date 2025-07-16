import { useEffect, useState } from 'react'

export function useScrollDirection(threshold = 10) {
  const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up')

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollDir = () => {
      const scrollY = window.scrollY
      if (Math.abs(scrollY - lastScrollY) >= threshold) {
        setScrollDir(scrollY > lastScrollY ? 'down' : 'up')
        lastScrollY = scrollY > 0 ? scrollY : 0
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrollDir
}
