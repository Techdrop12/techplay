// src/components/ui/ThemeToggle.tsx — sync avec ThemeProvider (data-theme + color-scheme)
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/themeContext' // ← pour notifier le contexte

type Props = {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getSystemPref(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** applique aussi data-theme + color-scheme pour cohérence globale */
function applyThemeDom(mode: 'light' | 'dark') {
  const root = document.documentElement
  const isDark = mode === 'dark'
  root.classList.toggle('dark', isDark)
  root.setAttribute('data-theme', mode)
  ;(root.style as any).colorScheme = isDark ? 'dark' : 'light'
}

export default function ThemeToggle({ className, iconOnly = true, size = 'md' }: Props) {
  const { theme: ctxTheme, setTheme: setCtxTheme } = (useTheme() as any) || {}
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(ctxTheme ?? 'light')

  useEffect(() => {
    setMounted(true)
    try {
      const saved = (localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null)
      const initial = (saved && saved !== 'system' ? saved : getSystemPref()) as 'light' | 'dark'
      applyThemeDom(initial)
      setTheme(initial)
      setCtxTheme?.(initial)
    } catch {
      const initial = getSystemPref()
      applyThemeDom(initial)
      setTheme(initial)
      setCtxTheme?.(initial)
    }

    // Suivre le changement système si l’utilisateur n’a pas figé un thème
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      try {
        const saved = localStorage.getItem('theme')
        if (!saved || saved === 'system') {
          const sys = getSystemPref()
          applyThemeDom(sys)
          setTheme(sys)
          setCtxTheme?.(sys)
        }
      } catch {}
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
    applyThemeDom(next)
    setTheme(next)
    setCtxTheme?.(next)
    try { localStorage.setItem('theme', next) } catch {}
  }

  if (!mounted) return null

  const sizes = { sm: 'p-1 text-base', md: 'p-2 text-xl', lg: 'p-3 text-2xl' }

  return (
    <button
      onClick={toggle}
      aria-label="Basculer le thème"
      title={theme === 'dark' ? 'Passer en clair' : 'Passer en sombre'}
      className={cn(
        'rounded-full border transition bg-white text-black dark:bg-gray-800 dark:text-white hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        sizes[size],
        className
      )}
    >
      {iconOnly ? (theme === 'dark' ? '☀️' : '🌙') : theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  )
}
