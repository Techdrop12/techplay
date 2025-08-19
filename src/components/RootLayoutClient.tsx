'use client'

import {useEffect, useLayoutEffect} from 'react'

type Props = { children: React.ReactNode }

function applyThemeFromStorageOrSystem() {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  const isDark = saved
    ? saved === 'dark'
    : prefersDark

  const root = document.documentElement
  root.classList.toggle('dark', !!isDark)
  // hint pour les composants natifs (inputs, etc.)
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export default function RootLayoutClient({ children }: Props) {
  // Applique avant paint pour éviter le flash clair/sombre
  useLayoutEffect(() => {
    applyThemeFromStorageOrSystem()
  }, [])

  // Suit les changements du thème système si l’utilisateur n’a rien fixé
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved && saved !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent | { matches: boolean }) => {
      const root = document.documentElement
      root.classList.toggle('dark', e.matches)
      root.style.colorScheme = e.matches ? 'dark' : 'light'
    }

    try {
      mql.addEventListener('change', onChange as any)
    } catch {
      // Safari < 14
      mql.addListener(onChange as any)
    }

    return () => {
      try {
        mql.removeEventListener('change', onChange as any)
      } catch {
        mql.removeListener(onChange as any)
      }
    }
  }, [])

  return <>{children}</>
}
