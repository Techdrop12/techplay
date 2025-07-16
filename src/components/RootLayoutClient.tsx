'use client'

import { useEffect } from 'react'

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const saved = localStorage.getItem('theme')
      const isDark = saved ? saved === 'dark' : prefersDark
      document.documentElement.classList.toggle('dark', isDark)
    }
  }, [])

  return <>{children}</>
}
