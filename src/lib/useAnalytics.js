// src/lib/useAnalytics.js
'use client'

import { useEffect } from 'react'

export default function useAnalytics() {
  useEffect(() => {
    // Google Analytics
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
      const gaScript = document.createElement('script')
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`
      gaScript.async = true
      document.head.appendChild(gaScript)

      const inlineScript = document.createElement('script')
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
      `
      document.head.appendChild(inlineScript)
    }

    // Meta Pixel (Facebook)
    if (process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      const fbScript = document.createElement('script')
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod ?
        n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
        fbq('track','PageView');
      `
      document.head.appendChild(fbScript)

      const fbNoScript = document.createElement('noscript')
      fbNoScript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1"/>
      `
      document.body.appendChild(fbNoScript)
    }
  }, [])
}
