'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { pageview } from '@/lib/ga';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 🔁 Pageview à chaque navigation
  useEffect(() => {
    if (!GA_ID) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    pageview(url);
  }, [pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      {/* Charge GA4 une fois le client hydraté */}
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
