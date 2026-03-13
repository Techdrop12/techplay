'use client'

import { useEffect } from 'react'

interface GeoDetectorProps {
  onDetect: (country: string) => void
}

export default function GeoDetector({ onDetect }: GeoDetectorProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof onDetect !== 'function') return

    const CACHE_KEY = 'geo:country'
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        onDetect(cached)
        return
      }
    } catch {}

    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5000) // timeout 5s

    fetch('/api/geolocate', { signal: ctrl.signal, cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((loc) => {
        const country =
          (loc && (loc.country || loc.countryCode || loc.cc)) ? String(loc.country || loc.countryCode || loc.cc) : null
        if (country) {
          const cc = country.toUpperCase()
          try { sessionStorage.setItem(CACHE_KEY, cc) } catch {}
          onDetect(cc)
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(t))

    return () => {
      clearTimeout(t)
      try { ctrl.abort() } catch {}
    }
  }, [onDetect])

  return null
}
