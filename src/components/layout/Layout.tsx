'use client'

import { ReactNode, useEffect, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { pageview } from '@/lib/ga'
import Header from './Header'
import Footer from '@/components/Footer'
import LiveChat from '../LiveChat'
import { useTheme } from '@/context/themeContext'

// Lazy (client only)
const PWAInstall = dynamic(() => import('./PWAInstall'), { ssr: false })
const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })

interface LayoutProps {
  children: ReactNode
  /** Active le tracking pageview (GA/…) */
  analytics?: boolean
  /** Active le widget de chat (si configuré) */
  chat?: boolean
  /** Affiche l’invite d’installation PWA */
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
  const firstRenderRef = useRef(true)

  // Pageview à chaque changement de route (évite le tir au 1er render SSR)
  useEffect(() => {
    if (!analytics) return
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }
    pageview(pathname)
  }, [pathname, analytics])

  // Announce route changes to screen readers
  const announcerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (announcerRef.current) {
      announcerRef.current.textContent = `Navigation vers ${document.title}`
    }
  }, [pathname])

  return (
    <>
      {/* Skip link pour clavier / lecteurs d’écran */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-[100] rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow ring-2 ring-offset-2 ring-black dark:bg-black dark:text-white dark:ring-white"
      >
        Aller au contenu principal
      </a>

      {/* Entête */}
      <Header />

      {/* Contenu principal */}
      <main
        id="main"
        role="main"
        data-theme={theme}
        className="relative min-h-screen bg-white text-gray-900 transition-colors dark:bg-gray-950 dark:text-white"
        aria-label="Contenu principal"
      >
        <Suspense fallback={null}>{children}</Suspense>
      </main>

      {/* PWA prompt (client only) */}
      {pwaPrompt && <PWAInstall />}

      {/* Bouton retour haut */}
      <ScrollTopButton />

      {/* Chat optionnel */}
      {chat && <LiveChat />}

      {/* Pied de page */}
      <Footer />

      {/* Portal root (modales, etc.) */}
      <div id="portal-root" />

      {/* Announcer ARIA (invisible) */}
      <div
        ref={announcerRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  )
}
