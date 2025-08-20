// src/components/MetaPixel.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_PIXEL_IN_DEV === 'true'

function isEnabled() {
  if (!PIXEL_ID) return false
  if (typeof window === 'undefined') return false
  const dnt =
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  let optedOut = false
  try {
    optedOut = localStorage.getItem('pixel:disabled') === '1'
  } catch {}
  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  return true
}

export default function MetaPixel() {
  const pathname = usePathname() || '/'

  // Déclenche un PageView à chaque navigation
  useEffect(() => {
    if (!isEnabled()) return
    try {
      window.fbq?.('track', 'PageView')
    } catch {
      // no-op
    }
  }, [pathname])

  if (!PIXEL_ID || !isEnabled()) return null

  return (
    <>
      {/* Snippet officiel Meta Pixel (sans PageView auto) */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          // Pas de fbq('track','PageView') ici : on le fait manuellement sur chaque navigation
        `}
      </Script>

      {/* Optionnel : balise noscript (peu utile côté client, mais inoffensif) */}
      <noscript
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
            <img height="1" width="1" style="display:none"
                 src="https://www.facebook.com/tr?id=${encodeURIComponent(
                   PIXEL_ID
                 )}&ev=PageView&noscript=1"/>
          `,
        }}
      />
    </>
  )
}
