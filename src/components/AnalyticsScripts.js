'use client'

import Script from 'next/script'

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || ''
const ENABLE_IN_DEV = process.env.NEXT_PUBLIC_CLARITY_IN_DEV === 'true'

function eligibleNow() {
  if (!CLARITY_ID) return false
  if (typeof window === 'undefined') return false

  // Respect DNT
  const dnt =
    (navigator && (navigator.doNotTrack === '1' || navigator.msDoNotTrack === '1')) ||
    (typeof window !== 'undefined' && window.doNotTrack === '1')

  // Opt-out locaux
  let optedOut = false
  try {
    optedOut =
      localStorage.getItem('clarity:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
  } catch {}

  // Consent analytics nécessaire
  let consentAnalytics = '0'
  try {
    consentAnalytics = localStorage.getItem('consent:analytics') || '0'
  } catch {}

  if (dnt || optedOut) return false
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false
  if (consentAnalytics !== '1') return false

  return true
}

/**
 * ⚠️ Ce composant ne charge PLUS GA4 ni Meta Pixel
 * (ils sont gérés par `Analytics.tsx` et `MetaPixel.tsx`).
 * Il ne s’occupe que de Microsoft Clarity, conditionné par le consentement.
 */
export default function AnalyticsScripts() {
  if (!eligibleNow()) return null

  return (
    <>
      {/* Microsoft Clarity — chargé après consentement (analytics) */}
      <Script id="clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            if (c.clarity) return;              // anti double init
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `}
      </Script>
    </>
  )
}
