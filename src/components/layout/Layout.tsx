// src/components/layout/Layout.tsx
'use client'

import { ReactNode, useEffect } from 'react'
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
      <Header />
      <main
        role="main"
        className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors"
        aria-label="Contenu principal"
      >
        {children}
      </main>
      {pwaPrompt && <PWAInstall />}
      <ScrollTopButton />
      {chat && <LiveChat />}
      <Footer />
    </>
  )
}
