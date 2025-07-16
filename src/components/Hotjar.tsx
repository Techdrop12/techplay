'use client'

import { useEffect } from 'react'
import { initHotjar } from '@/lib/hotjar'

export default function Hotjar() {
  useEffect(() => {
    initHotjar(1234567, 6) // remplacer par ton vrai ID
  }, [])

  return null
}
