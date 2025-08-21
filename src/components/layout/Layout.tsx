// src/components/layout/Layout.tsx — Ultimate ++ (CLS-safe, ARIA, progress, theme-color)
'use client'

import { type ReactNode, useEffect, Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import { usePathname } from 'next/navigation'
import { pageview } from '@/lib/ga'
import LiveChat from '../LiveChat'
import { useTheme } from '@/context/themeContext'

const PWAInstall = dynamic(() => import('./PWAInstall'), { ssr: false })
const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })
const FooterLazy = dynamic(() => import('@/components/Footer'), { ssr: true, loading: () => null })

interface LayoutProps {
  children: ReactNode
  analytics?: boolean
  chat?: boolean
  pwaPrompt?: boolean
}

export default function Layout({
  children,
  analytics = true,
  chat = false,
  pwaPrompt = true,
}: LayoutProps) {
  const pathname = usePathname()
  const { theme } = useTheme()

  const [isNavigating, setIsNavigating] = useState(false)
  const [routeAnnouncement, setRouteAnnouncement] = useState('')

  // Pageview
  useEffect(() => {
    if (!analytics || !pathname) return
    try { pageview(pathname) } catch {}
  }, [pathname, analytics])

  // Focus main after nav
  useEffect(() => {
    document.getElementById('main')?.focus()
  }, [pathname])

  // Minimal progress bar on route change
  useEffect(() => {
    if (!pathname) return
    setIsNavigating(true)
    const t = setTimeout(() => setIsNavigating(false), 650)
    return () => clearTimeout(t)
  }, [pathname])

  // Announce route change for SR users
  useEffect(() => {
    const label = document.title?.trim() || `Chargement de ${pathname}`
    setRouteAnnouncement(label)
  }, [pathname])

  // Update --header-offset using ResizeObserver (prevents CLS)
  useEffect(() => {
    const header =
      (document.querySelector('header[role="banner"]') as HTMLElement) ||
      (document.querySelector('header') as HTMLElement)
    if (!header || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect?.height ?? header.offsetHeight
      document.documentElement.style.setProperty('--header-offset', `${h}px`)
    })
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  // Mobile viewport fix (iOS 100vh)
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
    }
    setVh()
    window.addEventListener('resize', setVh)
    window.addEventListener('orientationchange', setVh)
    return () => {
      window.removeEventListener('resize', setVh)
      window.removeEventListener('orientationchange', setVh)
    }
  }, [])

  // Dynamic theme-color (status bar)
  useEffect(() => {
    const meta: HTMLMetaElement =
      (document.querySelector('meta[name="theme-color"]') as HTMLMetaElement) ||
      (document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' })) as HTMLMetaElement)

    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    if (bg) meta.setAttribute('content', `hsl(${bg})`)
  }, [theme, pathname])

  // Progressive enhancement: View Transitions (if supported)
  useEffect(() => {
    // @ts-ignore
    if (document.startViewTransition) {
      // @ts-ignore
      document.startViewTransition(() => {})
    }
  }, [pathname])

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

      {/* Global décor (grid + halo), non interactif */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.06] dark:opacity-[0.08]" />
        <div className="absolute inset-0 overlay-hero mix-blend-multiply dark:mix-blend-screen opacity-60" />
      </div>

      {/* Top progress bar */}
      <div
        aria-hidden
        className={`fixed left-0 right-0 top-[env(safe-area-inset-top)] z-[90] h-[2px] overflow-hidden ${isNavigating ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
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
        data-theme={theme}
        data-pathname={pathname ?? ''}
        // ⚠️ on retire "motion-section" pour éviter un masquage global
        className="relative min-h-[calc(var(--vh,1vh)*100)] pt-[var(--header-offset,4.5rem)] md:pt-20 bg-token-surface text-token-text transition-colors px-[max(0px,env(safe-area-inset-left))] pb-[max(0px,env(safe-area-inset-bottom))] pr-[max(0px,env(safe-area-inset-right))]"
        aria-label="Contenu principal"
        style={{ opacity: 1, visibility: 'visible' }}
      >
        <Suspense fallback={<div className="px-4 py-8 text-sm text-token-text/70">Chargement…</div>}>
          {children}
        </Suspense>
      </main>

      {/* Auxiliaires */}
      {pwaPrompt && <PWAInstall />}
      <ScrollTopButton />
      {chat && <LiveChat />}

      {/* Footer (SSR) */}
      <FooterLazy />
    </>
  )
}
