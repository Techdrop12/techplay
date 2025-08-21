// src/components/catalogue/FilterPanel.tsx
'use client'

import { useEffect, useMemo, useRef, useState, useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { event as gaEvent, logEvent, pushDataLayer } from '@/lib/ga'

type Props = {
  categories: string[]
  selected: string | null
  setSelected: (value: string | null) => void
  sticky?: boolean
  stickyTopClass?: string
  counts?: Record<string, number>
  syncQueryKey?: string
  id?: string
  className?: string
}

export default function FilterPanel({
  categories,
  selected,
  setSelected,
  sticky = true,
  stickyTopClass = 'top-16',
  counts,
  syncQueryKey = 'cat',
  id,
  className,
}: Props) {
  const reduced = useReducedMotion()
  const groupId = id || useId()
  const liveId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [announcement, setAnnouncement] = useState('')

  const items = useMemo(() => ['Tous', ...categories], [categories])

  // --- Sync URL -> state (init)
  useEffect(() => {
    if (!syncQueryKey) return
    try {
      const url = new URL(window.location.href)
      const current = url.searchParams.get(syncQueryKey)
      const normalized = current && current.trim() !== '' ? current : null
      if (normalized !== selected) {
        if (selected === null && normalized) setSelected(normalized)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- state -> URL
  useEffect(() => {
    if (!syncQueryKey) return
    try {
      const url = new URL(window.location.href)
      if (selected) url.searchParams.set(syncQueryKey, selected)
      else url.searchParams.delete(syncQueryKey)
      window.history.replaceState({}, '', url)
    } catch {}
  }, [selected, syncQueryKey])

  // --- a11y + analytics
  useEffect(() => {
    const label = selected ?? 'Tous'
    setAnnouncement(`Filtre appliqué : ${label}`)
    try {
      if ('vibrate' in navigator && !reduced) navigator.vibrate?.(12)
    } catch {}
    try {
      gaEvent?.({ action: 'filter_change', category: 'catalog', label, value: 1 })
      logEvent?.('filter_change', { label })
      pushDataLayer?.({ event: 'filter_change', filter_name: 'category', filter_value: label })
    } catch {}
  }, [selected, reduced])

  const currentIndex = useMemo(() => {
    if (!selected) return 0
    const i = items.findIndex((x) => x.toLowerCase() === selected.toLowerCase())
    return i >= 0 ? i : 0
  }, [items, selected])

  useEffect(() => {
    const el = btnRefs.current[currentIndex]
    const parent = containerRef.current
    if (el && parent) {
      const pRect = parent.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      if (r.left < pRect.left || r.right > pRect.right) {
        parent.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' })
      }
    }
  }, [currentIndex, selected])

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const len = items.length
    let target = currentIndex
    if (e.key === 'ArrowRight') target = (currentIndex + 1) % len
    else if (e.key === 'ArrowLeft') target = (currentIndex - 1 + len) % len
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = len - 1
    else return
    e.preventDefault()
    if (target === 0) setSelected(null)
    else setSelected(items[target])
    btnRefs.current[target]?.focus()
  }

  return (
    <div
      className={cn(
        'relative z-10',
        sticky &&
          `sticky ${stickyTopClass} backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40 bg-white/70 dark:bg-black/30 border-b border-gray-200/70 dark:border-gray-800/70`,
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
        <div
          ref={containerRef}
          id={groupId}
          role="radiogroup"
          aria-label="Filtrer par catégorie"
          aria-describedby={liveId}
          onKeyDown={onKeyDown}
          className="relative flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar py-1"
        >
          {items.map((label, i) => {
            const isAll = i === 0
            const active = isAll ? selected === null : selected?.toLowerCase() === label.toLowerCase()
            const count = !isAll && counts ? counts[label] : undefined

            return (
              <motion.button
                key={label}
                ref={(el) => { btnRefs.current[i] = el }}
                role="radio"
                aria-checked={active}
                aria-label={`Filtrer par catégorie : ${label}${typeof count === 'number' ? ` (${count})` : ''}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(isAll ? null : label)}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                className={cn(
                  'snap-start shrink-0 px-3.5 py-2 text-sm rounded-full border transition focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40',
                  active
                    ? 'bg-accent text-white border-accent shadow'
                    : 'bg-white/80 dark:bg-zinc-900/70 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-accent/50'
                )}
              >
                <span className="font-medium">{label}</span>
                {typeof count === 'number' && (
                  <span
                    className={cn(
                      'ml-2 inline-flex items-center justify-center rounded-full px-1.5 text-[11px]',
                      active ? 'bg-white/20' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}

          {selected && (
            <motion.button
              key="reset"
              role="button"
              aria-label="Réinitialiser le filtre"
              onClick={() => setSelected(null)}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              className="ml-1 shrink-0 px-3 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-zinc-900/70 hover:border-accent/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
            >
              Réinitialiser
            </motion.button>
          )}
        </div>

        <p id={liveId} className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  )
}
