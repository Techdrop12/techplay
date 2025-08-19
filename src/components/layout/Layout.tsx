'use client'

import { ReactNode, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Header from './Header'
import Footer from '@/components/Footer'
import { usePathname } from 'next/navigation'
import { pageview } from '@/lib/ga'
import LiveChat from '../LiveChat'
import { useTheme } from '@/context/themeContext'

const PWAInstall = dynamic(() => import('./PWAInstall'), { ssr: false })
const ScrollTopButton = dynamic(() => import('../ui/ScrollTopButton'), { ssr: false })

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

  useEffect(() => {
    if (analytics) pageview(pathname)
  }, [pathname, analytics])

  return (
    <>
      {/* ✅ Suspense globale pour couvrir tout composant client utilisant useSearchParams */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <main
        id="main"
        role="main"
        className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors"
        aria-label="Contenu principal"
      >
        <Suspense fallback={<div className="px-4 py-8 text-sm text-gray-500">Chargement…</div>}>
          {children}
        </Suspense>
      </main>

      {pwaPrompt && <PWAInstall />}
      <ScrollTopButton />
      {chat && <LiveChat />}

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  )
}
