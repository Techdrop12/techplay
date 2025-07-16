'use client'
import { useEffect } from 'react'
import { pageview } from '@/lib/ga'
import { usePathname } from 'next/navigation'
import Layout from './Layout'

export default function LayoutWithAnalytics({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    pageview(pathname)
  }, [pathname])

  return <Layout>{children}</Layout>
}
