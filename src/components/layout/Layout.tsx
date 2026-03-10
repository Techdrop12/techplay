'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import LiveChat from '../LiveChat'

import Header from './Header'

import { useTheme } from '@/context/themeContext'
import { pageview } from '@/lib/ga'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })
const FooterLazy = dynamic(() => import('@/components/Footer'), { ssr: true, loading: () => null })

interface LayoutProps {
  children: ReactNode
  analytics?: boolean
  chat?: boolean
}

type RequestIdle = (
  callback: (deadline: IdleDeadline) => void,
  options?: { timeout?: number }
) => number

export default function Layout({ children, analytics = true, chat = false }: LayoutProps) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { theme } = useTheme()
  const locale = getCurrentLocale(pathname) as 'fr' | 'en'

  const [isNavigating, setIsNavigating] = useState(false)
  const [routeAnnouncement, setRouteAnnouncement] = useState('')
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!analytics || !pathname) return
    try {
      pageview(pathname)
    } catch {}
  }, [pathname, analytics])

  useEffect(() => {
    requestAnimationFrame(() => {
      document.getElementById('main')?.focus()
    })
  }, [pathname])

  useEffect(() => {
    if (!pathname) return
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }

    setIsNavigating(true)
    const t = window.setTimeout(() => setIsNavigating(false), 650)
    return () => window.clearTimeout(t)
  }, [pathname])

  const localeStrings = useMemo(
    () => ({
      fr: { loading: (p: string) => `Chargement de ${p}` },
      en: { loading: (p: string) => `Loading ${p}` },
    }),
    []
  )

  useEffect(() => {
    const fallback = localeStrings[locale]?.loading(pathname) || pathname
    const label = document.title?.trim() || fallback
    setRouteAnnouncement(label)
  }, [pathname, locale, localeStrings])

  useEffect(() => {
    const header =
      (document.querySelector('header[role="banner"]') as HTMLElement | null) ||
      (document.querySelector('header') as HTMLElement | null)

    if (!header || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height ?? header.offsetHeight
      document.documentElement.style.setProperty('--header-offset', `${h}px`)
    })

    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const ensureMeta = (): HTMLMetaElement => {
      const found = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
      if (found) return found

      const el = document.createElement('meta')
      el.setAttribute('name', 'theme-color')
      document.head.appendChild(el)
      return el
    }

    const meta = ensureMeta()
    const rootStyle = getComputedStyle(document.documentElement)
    const hsl =
      rootStyle.getPropertyValue('--bg').trim() ||
      rootStyle.getPropertyValue('--token-surface').trim()

    if (hsl) meta.setAttribute('content', `hsl(${hsl})`)
  }, [theme, pathname])

  useEffect(() => {
    const docWithVT = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }

    if (typeof docWithVT.startViewTransition === 'function') {
      docWithVT.startViewTransition(() => {})
      document.getElementById('main')?.style.setProperty('view-transition-name', 'main')
    }
  }, [pathname])

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
        ))

    const clearRic: (id: number) => void =
      window.cancelIdleCallback?.bind(window) ?? ((id) => window.clearTimeout(id))

    const canPrefetch = () => {
      const conn = navigator.connection
      return !conn || (!conn.saveData && (!conn.effectiveType || conn.effectiveType === '4g'))
    }

    const id = ric(
      () => {
        if (!canPrefetch()) return
        try {
          router.prefetch(localizePath('/products', locale))
          router.prefetch(localizePath('/products/packs', locale))
          router.prefetch(localizePath('/wishlist', locale))
        } catch {}
      },
      { timeout: 1200 }
    )

    return () => clearRic(id)
  }, [locale, router])

  const loadingFallback = locale === 'fr' ? 'Chargement…' : 'Loading…'

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-[max(0.5rem,env(safe-area-inset-top))] focus:z-[100] rounded-md bg-token-surface px-3 py-2 text-token-text shadow-soft focus-ring"
      >
        {locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
      </a>

      <div aria-live="polite" role="status" className="sr-only">
        {routeAnnouncement}
      </div>

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.06] dark:opacity-[0.08]" />
        <div className="absolute inset-0 overlay-hero opacity-60 mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div
        aria-hidden
        className={`fixed left-0 right-0 top-[env(safe-area-inset-top)] z-[90] h-[2px] overflow-hidden transition-opacity duration-200 ${
          isNavigating ? 'opacity-100' : 'opacity-0'
        } motion-reduce:hidden`}
      >
        <div className="h-full w-1/3 animate-marquee-slow rounded-r-full bg-[hsl(var(--accent))]" />
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
        className="relative min-h-[calc(var(--vh,1vh)*100)] bg-token-surface px-[max(0px,env(safe-area-inset-left))] pb-[max(0px,env(safe-area-inset-bottom))] pr-[max(0px,env(safe-area-inset-right))] pt-[var(--header-offset,4.5rem)] text-token-text transition-colors"
        aria-label={locale === 'fr' ? 'Contenu principal' : 'Main content'}
        style={{ opacity: 1, visibility: 'visible' }}
      >
        <Suspense fallback={<div className="px-4 py-8 text-sm text-token-text/70">{loadingFallback}</div>}>
          {children}
        </Suspense>
      </main>

      <ScrollTopButton />
      {chat ? <LiveChat /> : null}

      <FooterLazy />
    </>
  )
}