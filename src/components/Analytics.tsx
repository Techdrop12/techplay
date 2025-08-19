// src/components/Analytics.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { pageview } from '@/lib/ga';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

export default function Analytics() {
  const pathname = usePathname() || '/';

  // Pageview à chaque navigation
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !GA_ID) return;
    const qs = typeof window !== 'undefined' ? window.location.search : '';
    pageview(`${pathname}${qs}`);
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga4-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            send_page_view: true,
            page_path: window.location.pathname + window.location.search
          });
        `}
      </Script>
    </>
  );
}
