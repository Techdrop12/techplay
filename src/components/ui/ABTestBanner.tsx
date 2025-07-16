'use client'
import { useEffect, useState } from 'react'
import { getBannerVariant } from '@/lib/ab-banner'

export default function ABTestBanner() {
  const [variant, setVariant] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('ab-banner')
    if (stored) {
      setVariant(stored)
    } else {
      const v = getBannerVariant()
      sessionStorage.setItem('ab-banner', v)
      setVariant(v)
    }
  }, [])

  if (!variant) return null

  return (
    <div className="bg-blue-100 text-blue-800 text-center py-2 text-sm">
      {variant}
    </div>
  )
}
