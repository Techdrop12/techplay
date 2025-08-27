// src/components/Tracking.tsx — Monte GA + Pixel + Hotjar + Clarity
'use client'
import dynamic from 'next/dynamic'

// On charge tous les trackers en client, chacun gère son éligibilité/consent
const Analytics = dynamic(() => import('./Analytics'), { ssr: false })
const MetaPixel = dynamic(() => import('./MetaPixel'), { ssr: false })
const Hotjar = dynamic(() => import('./Hotjar'), { ssr: false })
const Clarity = dynamic(() => import('./Clarity'), { ssr: false })

export default function Tracking() {
  return (
    <>
      <Analytics />
      <MetaPixel />
      <Hotjar />
      {/* Monte Clarity seulement si tu as NEXT_PUBLIC_CLARITY_ID */}
      <Clarity />
    </>
  )
}
