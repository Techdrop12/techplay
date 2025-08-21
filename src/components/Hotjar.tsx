'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

const HOTJAR_ID = Number(process.env.NEXT_PUBLIC_HOTJAR_ID ?? 0)
const HOTJAR_SV = Number(process.env.NEXT_PUBLIC_HOTJAR_SV ?? 6)
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_HOTJAR_IN_DEV === 'true'

function isEnabled() {
  if (!HOTJAR_ID) return false
  if (typeof window === 'undefined') return false
  const dnt =
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  let optedOut = false
  try {
    optedOut =
      localStorage.getItem('hotjar:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
  } catch {}
  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  return true
}

export default function Hotjar() {
  const pathname = usePathname() || '/'

  // SPA: notifier Hotjar à chaque changement de route
  useEffect(() => {
    if (!isEnabled()) return
    try {
      (window as any).hj?.('stateChange', pathname)
    } catch {}
  }, [pathname])

  if (!isEnabled()) return null

  return (
    <>
      <Script id="hotjar-init" strategy="afterInteractive">
        {`
          (function(h,o,t,j,a,r){
            if (h.hj) return;
            h.hj=function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_SV}};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `}
      </Script>
    </>
  )
}
