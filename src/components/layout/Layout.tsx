'use client'

import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import Header from './Header'

const LiveChatLazy = dynamic(() => import('../LiveChat'), { ssr: false })

import { useTheme } from '@/context/themeContext'
import { pageview } from '@/lib/ga'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })
const FooterLazy = dynamic(() => import('@/components/Footer'), {
  ssr: true,
  loading: () => null,
})

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
  const locale = getCurrentLocale(pathname)

  const [isNavigating, setIsNavigating] = useState(false)
  const [routeAnnouncement, setRouteAnnouncement] = useState('')
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!analytics || !pathname) return
    try {
      pageview(pathname)
    } catch {
      // no-op
    }
  }, [analytics, pathname])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }

    requestAnimationFrame(() => {
      document.getElementById('main')?.focus()
    })
  }, [pathname])

  useEffect(() => {
    if (!mountedRef.current) return

    setIsNavigating(true)
    const timeout = window.setTimeout(() => setIsNavigating(false), 550)

    return () => window.clearTimeout(timeout)
  }, [pathname])

  const localeStrings = useMemo(
    () => ({
      fr: {
        loading: (path: string) => `Chargement de ${path}`,
        skipToContent: 'Aller au contenu',
        mainLabel: 'Contenu principal',
      },
      en: {
        loading: (path: string) => `Loading ${path}`,
        skipToContent: 'Skip to content',
        mainLabel: 'Main content',
      },
    }),
    []
  )

  useEffect(() => {
    const fallback = localeStrings[locale].loading(pathname)

    const id = window.setTimeout(() => {
      const label = document.title?.trim() || fallback
      setRouteAnnouncement(label)
    }, 60)

    return () => window.clearTimeout(id)
  }, [pathname, locale, localeStrings])

  useEffect(() => {
    const header =
      (document.querySelector('header[role="banner"]') as HTMLElement | null) ||
      (document.querySelector('header') as HTMLElement | null)

    if (!header) return

    const setHeaderOffset = () => {
      const height = Math.max(header.offsetHeight, 72)
      document.documentElement.style.setProperty('--header-offset', `${height}px`)
    }

    setHeaderOffset()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', setHeaderOffset)
      return () => window.removeEventListener('resize', setHeaderOffset)
    }

    const observer = new ResizeObserver(() => setHeaderOffset())
    observer.observe(header)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const ensureMeta = (): HTMLMetaElement => {
      const selector = 'meta[name="theme-color"][data-runtime-theme-color="true"]'
      const existing = document.querySelector(selector) as HTMLMetaElement | null
      if (existing) return existing

      const el = document.createElement('meta')
      el.setAttribute('name', 'theme-color')
      el.setAttribute('data-runtime-theme-color', 'true')
      document.head.appendChild(el)
      return el
    }

    const meta = ensureMeta()
    const rootStyle = getComputedStyle(document.documentElement)
    const bg = rootStyle.getPropertyValue('--bg').trim()
    const surface = rootStyle.getPropertyValue('--surface').trim()
    const value = bg || surface

    if (value) {
      meta.setAttribute('content', `hsl(${value})`)
    }
  }, [pathname, theme])

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
          router.prefetch(localizePath('/blog', locale))
        } catch {
          // no-op
        }
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
        {localeStrings[locale].skipToContent}
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
        aria-label={localeStrings[locale].mainLabel}
        className="relative min-h-[calc(var(--vh,1vh)*100)] bg-token-surface px-[max(0px,env(safe-area-inset-left))] pb-[max(0px,env(safe-area-inset-bottom))] pr-[max(0px,env(safe-area-inset-right))] pt-[var(--header-offset,4.5rem)] text-token-text transition-colors"
        style={{ opacity: 1, visibility: 'visible' }}
      >
        <Suspense
          fallback={<div className="px-4 py-8 text-sm text-token-text/70">{loadingFallback}</div>}
        >
          {children}
        </Suspense>
      </main>

      <ScrollTopButton />
      {chat ? <LiveChatLazy /> : null}
      <FooterLazy />
    </>
  )
}