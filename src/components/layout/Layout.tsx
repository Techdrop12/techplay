'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, type ReactNode, useEffect, useRef, useState } from 'react';

import Header from './Header';

const LiveChatLazy = dynamic(() => import('../LiveChat'), { ssr: false });

import { useTheme } from '@/context/themeContext';
import { pageview } from '@/lib/ga';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';

const NAV_START_EVENT = 'nextjs:nav-start';
const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false });
const FooterLazy = dynamic(() => import('@/components/Footer'), {
  ssr: true,
  loading: () => null,
});

interface LayoutProps {
  children: ReactNode;
  analytics?: boolean;
  chat?: boolean;
}

type RequestIdle = (
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout?: number }
) => number;

export default function Layout({ children, analytics = true, chat = false }: LayoutProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { theme } = useTheme();
  const locale = getCurrentLocale(pathname);

  const [isNavigating, setIsNavigating] = useState(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!analytics || !pathname) return;
    try {
      pageview(pathname);
    } catch {
      // no-op
    }
  }, [analytics, pathname]);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById('main')?.focus();
    });
  }, [pathname]);

  // Show progress bar on navigation start (link click) and when pathname changes
  useEffect(() => {
    const onNavStart = () => setIsNavigating(true);
    window.addEventListener(NAV_START_EVENT, onNavStart);
    return () => window.removeEventListener(NAV_START_EVENT, onNavStart);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    setIsNavigating(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Garder la barre visible plus longtemps pour que le contenu ait le temps de s'afficher
    const timeout = window.setTimeout(() => setIsNavigating(false), 520);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  const tCommon = useTranslations('common');
  const tAria = useTranslations('aria');

  useEffect(() => {
    const fallback = tCommon('loading_page', { path: pathname });

    const id = window.setTimeout(() => {
      const label = document.title?.trim() || fallback;
      setRouteAnnouncement(label);
    }, 60);

    return () => window.clearTimeout(id);
  }, [pathname, tCommon]);

  useEffect(() => {
    const header =
      (document.querySelector('header[role="banner"]') as HTMLElement | null) ||
      (document.querySelector('header') as HTMLElement | null);

    if (!header) return;

    const setHeaderOffset = () => {
      const height = Math.max(header.offsetHeight, 72);
      document.documentElement.style.setProperty('--header-offset', `${height}px`);
    };

    setHeaderOffset();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', setHeaderOffset);
      return () => window.removeEventListener('resize', setHeaderOffset);
    }

    const observer = new ResizeObserver(() => setHeaderOffset());
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const ensureMeta = (): HTMLMetaElement => {
      const selector = 'meta[name="theme-color"][data-runtime-theme-color="true"]';
      const existing = document.querySelector(selector) as HTMLMetaElement | null;
      if (existing) return existing;

      const el = document.createElement('meta');
      el.setAttribute('name', 'theme-color');
      el.setAttribute('data-runtime-theme-color', 'true');
      document.head.appendChild(el);
      return el;
    };

    const meta = ensureMeta();
    const rootStyle = getComputedStyle(document.documentElement);
    const bg = rootStyle.getPropertyValue('--bg').trim();
    const surface = rootStyle.getPropertyValue('--surface').trim();
    const value = bg || surface;

    if (value) {
      meta.setAttribute('content', `hsl(${value})`);
    }
  }, [pathname, theme]);

  useEffect(() => {
    const ric: RequestIdle =
      window.requestIdleCallback?.bind(window) ??
      ((callback, options) =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 0,
            }),
          options?.timeout ?? 350
        ));

    const clearRic: (id: number) => void =
      window.cancelIdleCallback?.bind(window) ?? ((id) => window.clearTimeout(id));

    const canPrefetch = () => {
      const conn = navigator.connection;
      return !conn || (!conn.saveData && (!conn.effectiveType || conn.effectiveType === '4g'));
    };

    const id = ric(
      () => {
        if (!canPrefetch()) return;

        try {
          router.prefetch(localizePath('/products', locale));
          router.prefetch(localizePath('/products/packs', locale));
          router.prefetch(localizePath('/wishlist', locale));
          router.prefetch(localizePath('/blog', locale));
          router.prefetch(localizePath('/contact', locale));
          router.prefetch(localizePath('/account', locale));
          router.prefetch(localizePath('/commande', locale));
        } catch {
          // no-op
        }
      },
      { timeout: 800 }
    );

    return () => clearRic(id);
  }, [locale, router]);

  const loadingFallback = tCommon('loading');

  return (
    <>
      <div aria-live="polite" role="status" className="sr-only">
        {routeAnnouncement}
      </div>

      {/* Calque décoratif jour/nuit : ne doit jamais intercepter les clics (z-index négatif + pointer-events forcé) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 isolate"
        style={{ pointerEvents: 'none', touchAction: 'none' }}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06] dark:opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 overlay-hero opacity-60 mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div
        aria-hidden
        className={`pointer-events-none fixed left-0 right-0 top-[env(safe-area-inset-top)] z-[90] h-[3px] overflow-hidden transition-opacity duration-150 ${
          isNavigating ? 'opacity-100' : 'opacity-0'
        } motion-reduce:hidden`}
      >
        <div
          key={`nav-${pathname}-${isNavigating}`}
          className="nav-progress-bar-inner h-full w-0 rounded-r-full bg-[hsl(var(--accent))]"
        />
      </div>

      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <main
        id="main"
        role="main"
        tabIndex={-1}
        aria-busy={isNavigating || undefined}
        data-theme={theme}
        data-pathname={pathname}
        aria-label={tAria('main_content')}
        className="relative z-0 min-h-[calc(var(--vh,1vh)*100)] bg-token-surface px-[max(0px,env(safe-area-inset-left))] pb-[max(0px,env(safe-area-inset-bottom))] pr-[max(0px,env(safe-area-inset-right))] pt-[var(--header-offset,4.5rem)] text-token-text transition-colors page-entrance"
      >
        <Suspense
          fallback={
            <div
              className="flex min-h-[40vh] items-center justify-center px-4 py-12"
              role="status"
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-2 text-sm text-token-text/70">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--accent))]/30 border-t-[hsl(var(--accent))]"
                  aria-hidden
                />
                {loadingFallback}
              </span>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      <ScrollTopButton />
      {chat ? <LiveChatLazy /> : null}
      <FooterLazy />
    </>
  );
}
