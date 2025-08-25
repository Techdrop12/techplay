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

/* ---------- Icônes SVG propres (inline, zéro dépendance) ---------- */
const Icon = {
  Headphones: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a7 7 0 0 1 14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z"/>
    </svg>
  ),
  Keyboard: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M3 6h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 3h2v2H5V9Zm3 0h2v2H8V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9ZM5 12h2v2H5v-2Zm3 0h2v2H8v-2Zm3 0h5v2h-5v-2Z"/>
    </svg>
  ),
  Mouse: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6Zm0 2a4 4 0 0 0-4 4v2h8V8a4 4 0 0 0-4-4Zm-.5 1h1v3h-1V5Z"/>
    </svg>
  ),
  Camera: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M9 4h6l1.5 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3L9 4Zm3 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/>
    </svg>
  ),
  Battery: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M2 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8Zm9 1-3 5h2v3l3-5h-2V9Z"/>
    </svg>
  ),
  Speaker: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm5 2a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 6Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
    </svg>
  ),
  Drive: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm3 1h10v3H7V8Zm0 5h6v4H7v-4Z"/>
    </svg>
  ),
  Monitor: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}>
      <path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7v2h3v2H7v-2h3v-2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>
    </svg>
  ),
}

/** Normalise une étiquette humaine en « slug » simple (sans accents). */
const toKey = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** Dictionnaire catégorie → icône */
const CAT_ICONS: Record<string, (p: any) => JSX.Element> = {
  casques: Icon.Headphones,
  claviers: Icon.Keyboard,
  souris: Icon.Mouse,
  webcams: Icon.Camera,
  batteries: Icon.Battery,
  audio: Icon.Speaker,
  stockage: Icon.Drive,
  ecrans: Icon.Monitor,
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
    try { if ('vibrate' in navigator && !reduced) navigator.vibrate?.(12) } catch {}
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

            // Choix de l'icône si on reconnaît la catégorie
            const key = toKey(label)
            const CIcon = !isAll ? CAT_ICONS[key] : undefined

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
                <span className="inline-flex items-center gap-2 font-medium">
                  {CIcon && <CIcon className="opacity-80" />}
                  {label}
                </span>
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
