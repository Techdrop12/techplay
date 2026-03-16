'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type ClarityConsentState = Pick<Gtag.ConsentUpdate, 'ad_storage' | 'analytics_storage'>;

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? '';
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_CLARITY_IN_DEV || '').toLowerCase() === 'true';

function consentState(): ClarityConsentState {
  try {
    const s = window.__consentState ?? {};
    const analyticsGranted =
      s.analytics_storage === 'granted' || localStorage.getItem('consent:analytics') === '1';

    const adsGranted =
      s.ad_storage === 'granted' ||
      s.ad_user_data === 'granted' ||
      s.ad_personalization === 'granted' ||
      localStorage.getItem('consent:ads') === '1';

    return {
      ad_storage: adsGranted ? 'granted' : 'denied',
      analytics_storage: analyticsGranted ? 'granted' : 'denied',
    };
  } catch {
    return {
      ad_storage: 'denied',
      analytics_storage: 'denied',
    };
  }
}

function eligibleNow(): boolean {
  if (!CLARITY_ID) return false;
  if (typeof window === 'undefined') return false;

  const dnt =
    navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1';

  let optedOut = false;
  try {
    optedOut =
      localStorage.getItem('clarity:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1';
  } catch {}

  if (dnt || optedOut) return false;
  if (process.env.NODE_ENV !== 'production' && !ENABLE_IN_DEV) return false;

  return consentState().analytics_storage === 'granted';
}

function syncClarityConsent() {
  try {
    if (typeof window === 'undefined' || typeof window.clarity !== 'function') return;

    const cs = consentState();

    if (cs.ad_storage === 'denied' && cs.analytics_storage === 'denied') {
      window.clarity('consent', false);
      return;
    }

    window.clarity('consentv2', cs);
  } catch {}
}

export default function Clarity() {
  const pathname = usePathname() || '/';
  const [shouldLoad, setShouldLoad] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    setShouldLoad(eligibleNow());
  }, []);

  useEffect(() => {
    const onConsent = () => {
      const ok = eligibleNow();
      setShouldLoad(ok);

      if (ok) {
        syncClarityConsent();
      } else if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
        try {
          window.clarity('consent', false);
        } catch {}
      }
    };

    window.addEventListener('tp:consent', onConsent);
    return () => window.removeEventListener('tp:consent', onConsent);
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    syncClarityConsent();
  }, [pathname]);

  if (!shouldLoad) return null;

  return (
    <Script
      id="clarity"
      strategy="afterInteractive"
      onLoad={() => {
        loadedRef.current = true;
        syncClarityConsent();
      }}
    >
      {`
        (function(c,l,a,r,i,t,y){
          if (c[a]) return;
          c[a]=function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);
          t.async=1;
          t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];
          if (y && y.parentNode) y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", ${JSON.stringify(CLARITY_ID)});
      `}
    </Script>
  );
}
