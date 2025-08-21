// src/components/layout/Layout.tsx
'use client'

import { type ReactNode, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import { usePathname } from 'next/navigation'
import { pageview } from '@/lib/ga'
import LiveChat from '../LiveChat'
import { useTheme } from '@/context/themeContext'

// Lazy chunks non-critiques
const PWAInstall = dynamic(() => import('./PWAInstall'), { ssr: false })
const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })

// ⚠️ compat Next types: pas d'option "suspense" ici
const FooterLazy = dynamic(() => import('@/components/Footer'), {
  ssr: true,
  loading: () => null,
})

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

  // Pageview sur changement de route (safe)
  useEffect(() => {
    if (!analytics || !pathname) return
    try { pageview(pathname) } catch {}
  }, [pathname, analytics])

  // Focus sur <main> après navigation (accessibilité)
  useEffect(() => {
    document.getElementById('main')?.focus()
  }, [pathname])

  return (
    <>
      {/* ✅ Barrière Suspense globale (couvre hooks de navigation côté client) */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <main
        id="main"
        role="main"
        tabIndex={-1}
        data-theme={theme}
        className="relative min-h-screen pt-16 md:pt-20 bg-token-surface text-token-text transition-colors"
        aria-label="Contenu principal"
      >
        <Suspense fallback={<div className="px-4 py-8 text-sm text-token-text/70">Chargement…</div>}>
          {children}
        </Suspense>
      </main>

      {pwaPrompt && <PWAInstall />}
      <ScrollTopButton />
      {chat && <LiveChat />}

      {/* plus de Suspense ici pour compat types */}
      <FooterLazy />
    </>
  )
}
