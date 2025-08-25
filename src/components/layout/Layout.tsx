// src/components/layout/Layout.tsx — Ultra Premium FINAL (CLS-safe, A11y+, VT, idle-prefetch)
'use client'

import { type ReactNode, useEffect, Suspense, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import { usePathname, useRouter } from 'next/navigation'
import { pageview } from '@/lib/ga'
import LiveChat from '../LiveChat'
import { useTheme } from '@/context/themeContext'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

// ⛔️ supprimé: import('./PWAInstall')
// (le prompt PWA est désormais géré uniquement par src/app/layout.tsx via <AppInstallPrompt/>)
const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })
const FooterLazy = dynamic(() => import('@/components/Footer'), { ssr: true, loading: () => null })

interface LayoutProps {
  children: ReactNode
  analytics?: boolean
  chat?: boolean
}

export default function Layout({ children, analytics = true, chat = false }: LayoutProps) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { theme } = useTheme()
  const locale = getCurrentLocale(pathname)

  const [isNavigating, setIsNavigating] = useState(false)
  const [routeAnnouncement, setRouteAnnouncement] = useState('')
  const mountedRef = useRef(false)

  /** ───────────────────── Analytics pageview */
  useEffect(() => {
    if (!analytics || !pathname) return
    try { pageview(pathname) } catch {}
  }, [pathname, analytics])

  /** ───────────────────── Focus main after nav */
  useEffect(() => {
    requestAnimationFrame(() => { document.getElementById('main')?.focus() })
  }, [pathname])

  /** ───────────────────── Top progress + aria-busy (skip first mount) */
  useEffect(() => {
    if (!pathname) return
    if (!mountedRef.current) { mountedRef.current = true; return }
    setIsNavigating(true)
    const t = window.setTimeout(() => setIsNavigating(false), 650)
    return () => window.clearTimeout(t)
  }, [pathname])

  /** ───────────────────── SR route announcement */
  useEffect(() => {
    const label = document.title?.trim() || `Chargement de ${pathname}`
    setRouteAnnouncement(label)
  }, [pathname])

  /** ───────────────────── Header offset (CLS guard) */
  useEffect(() => {
    const header =
      (document.querySelector('header[role="banner"]') as HTMLElement) ||
      (document.querySelector('header') as HTMLElement)
    if (!header || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height ?? header.offsetHeight
      document.documentElement.style.setProperty('--header-offset', `${h}px`)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  /** ───────────────────── Dynamic theme-color (status bar) */
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
    const hsl = rootStyle.getPropertyValue('--bg').trim() || rootStyle.getPropertyValue('--token-surface').trim()
    if (hsl) meta.setAttribute('content', `hsl(${hsl})`)
  }, [theme, pathname])

  /** ───────────────────── View Transitions (guarded) */
  useEffect(() => {
    const anyDoc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (typeof anyDoc.startViewTransition === 'function') {
      anyDoc.startViewTransition(() => {})
      document.getElementById('main')?.style.setProperty('view-transition-name', 'main')
    }
  }, [pathname])

  /** ───────────────────── Idle prefetch (réseaux rapides, no save-data) */
  useEffect(() => {
    const ric: ((cb: IdleRequestCallback, opts?: IdleRequestOptions) => number) =
      (window as any).requestIdleCallback ||
      ((cb: IdleRequestCallback) => window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 } as any), 350))
    const clearRic: (id: number) => void = (window as any).cancelIdleCallback || window.clearTimeout

    const canPrefetch = () => {
      const nav: any = navigator
      return (
        !nav?.connection ||
        (!nav.connection.saveData &&
          (!nav.connection.effectiveType || nav.connection.effectiveType === '4g'))
      )
    }

    const id = ric(() => {
      if (!canPrefetch()) return
      try {
        router.prefetch(localizePath('/products', locale))
        router.prefetch(localizePath('/products/packs', locale))
        router.prefetch(localizePath('/wishlist', locale))
      } catch {}
    }, { timeout: 1200 })

    return () => clearRic(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, router])

  return (
    <>
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-[max(0.5rem,env(safe-area-inset-top))] focus:z-[100] px-3 py-2 rounded-md focus-ring bg-token-surface text-token-text shadow-soft"
      >
        Aller au contenu
      </a>

      {/* Route change announcement for screen readers */}
      <div aria-live="polite" role="status" className="sr-only">
        {routeAnnouncement}
      </div>

      {/* Global décor */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.06] dark:opacity-[0.08]" />
        <div className="absolute inset-0 overlay-hero mix-blend-multiply dark:mix-blend-screen opacity-60" />
      </div>

      {/* Top progress bar */}
      <div
        aria-hidden
        className={`fixed left-0 right-0 top-[env(safe-area-inset-top)] z-[90] h-[2px] overflow-hidden transition-opacity duration-200 ${
          isNavigating ? 'opacity-100' : 'opacity-0'
        } motion-reduce:hidden`}
      >
        <div className="h-full w-1/3 animate-marquee-slow bg-[hsl(var(--accent))] rounded-r-full" />
      </div>

      {/* Header */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      {/* Main */}
      <main
        id="main"
        role="main"
        tabIndex={-1}
        aria-busy={isNavigating || undefined}
        data-theme={theme}
        data-pathname={pathname ?? ''}
        className="relative min-h-[calc(var(--vh,1vh)*100)] pt-[var(--header-offset,4.5rem)] bg-token-surface text-token-text transition-colors px-[max(0px,env(safe-area-inset-left))] pb-[max(0px,env(safe-area-inset-bottom))] pr-[max(0px,env(safe-area-inset-right))]"
        aria-label="Contenu principal"
        style={{ opacity: 1, visibility: 'visible' }}
      >
        <Suspense fallback={<div className="px-4 py-8 text-sm text-token-text/70">Chargement…</div>}>
          {children}
        </Suspense>
      </main>

      {/* Auxiliaires */}
      <ScrollTopButton />
      {chat && <LiveChat />}

      {/* Footer (SSR) */}
      <FooterLazy />
    </>
  )
}
