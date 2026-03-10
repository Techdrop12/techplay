'use client'

import { useCallback } from 'react'

interface AccessibilitySkipProps {
  target?: string
  label?: string
  className?: string
}

export default function AccessibilitySkip({
  target = '#main',
  label = 'Aller au contenu principal',
  className = '',
}: AccessibilitySkipProps) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      try {
        const id = String(target).replace(/^#/, '')
        const el =
          document.getElementById(id) ||
          document.querySelector(String(target)) ||
          document.querySelector('#main-content') ||
          document.querySelector('main')

        if (!(el instanceof HTMLElement)) return

        const hadTabIndex = el.hasAttribute('tabindex')
        if (!hadTabIndex) el.setAttribute('tabindex', '-1')

        el.focus({ preventScroll: true })

        try {
          el.scrollIntoView({ block: 'start', behavior: 'smooth' })
        } catch {
          // no-op
        }

        e.preventDefault()

        const restore = () => {
          if (!hadTabIndex) el.removeAttribute('tabindex')
          el.removeEventListener('blur', restore)
        }

        el.addEventListener('blur', restore)
      } catch {
        // no-op
      }
    },
    [target]
  )

  return (
    <a
      id="skip-to-content"
      href={target}
      onClick={onClick}
      className={[
        'sr-only focus-visible:not-sr-only',
        'fixed left-2 top-2 z-[9999]',
        'rounded-lg bg-yellow-300 px-4 py-2 text-black shadow',
        'outline-none ring-0 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2',
        'dark:bg-yellow-400',
        className,
      ].join(' ')}
    >
      {label}
    </a>
  )
}