'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

import { CartProvider } from '@/context/cartContext';
import { ThemeProvider } from '@/context/themeContext';
import { UpsellProvider } from '@/context/upsellContext';

import PushPermission from '@/components/PushPermission';
import ScoreTracker from '@/components/ScoreTracker';
import useHotjar from '@/lib/hotjar';
import { requestAndSaveToken, listenToMessages } from '@/lib/firebase-client';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function ClientWrapper({ children }) {
  const pathname = usePathname();

  // Hotjar
  useHotjar();

  // Google Analytics – déclenché sur chaque changement de route
  useEffect(() => {
    if (typeof window !== 'undefined' && GA_ID) {
      window.gtag?.('event', 'page_view', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  // Firebase Messaging – enregistrement token + écoute messages
  useEffect(() => {
    requestAndSaveToken().then((token) => {
      if (token) {
        console.log('[ClientWrapper] Token FCM stocké avec succès :', token);
      }
    });
    listenToMessages();
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <UpsellProvider>
          {/* Google Analytics */}
          {GA_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `}
              </Script>
            </>
          )}

          {/* Meta Pixel (Facebook) */}
          {META_PIXEL_ID && (
            <>
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
                  fbq('init', '${META_PIXEL_ID}');
                  fbq('track','PageView');
                `}
              </Script>
              <noscript>
                <img
                  height="1"
                  width="1"
                  style={{ display: 'none' }}
                  src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                  alt=""
                />
              </noscript>
            </>
          )}

          {/* Bonus : autorisation push, gamification, notifications toast */}
          <PushPermission />
          <ScoreTracker />
          {children}
          <Toaster position="top-right" />
        </UpsellProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
