// src/components/ui/ThemeToggle.tsx — canon (contexte-only, SSR-safe, a11y)
'use client'

import { useEffect, useState } from 'react'

import { useTheme } from '@/context/themeContext'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ className, iconOnly = true, size = 'md' }: Props) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'
  const sizes = { sm: 'p-1 text-base', md: 'p-2 text-xl', lg: 'p-3 text-2xl' }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      title={isDark ? 'Passer en clair' : 'Passer en sombre'}
      className={cn(
        'rounded-full border transition bg-white text-black dark:bg-gray-800 dark:text-white hover:scale-[1.04] ' +
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        sizes[size],
        className
      )}
    >
      {iconOnly ? (isDark ? '☀️' : '🌙') : isDark ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  )
}
