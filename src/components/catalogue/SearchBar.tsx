// src/components/catalogue/SearchBar.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import type { FuseResultMatch, FuseResult } from 'fuse.js'
import type { Product } from '@/types/product'
import { cn } from '@/lib/utils'
import { event as gaEvent, logEvent } from '@/lib/ga'

interface Props {
  products: Product[]
  /** Valeur contrôlée depuis le parent (affichée dans l’input) */
  query: string
  /** Setter contrôlé depuis le parent */
  setQuery: (value: string) => void
  /** Id facultatif (utile si plusieurs barres) */
  id?: string
  className?: string
}

const RECENTS_KEY = 'tp:search:recents'

/** util — met un <mark> autour des matchs Fuse (sur le title) */
function highlight(text: string, matches?: ReadonlyArray<FuseResultMatch>) {
  if (!matches?.length) return text
  const m = matches.find((mm) => mm.key === 'title') ?? matches[0]
  const indices = m.indices as Array<[number, number]> | undefined
  if (!indices?.length) return text

  const parts: React.ReactNode[] = []
  let last = 0
  indices.forEach(([start, end], i) => {
    if (start > last) parts.push(text.slice(last, start))
    parts.push(
      <mark key={`hl-${i}`} className="bg-yellow-200/70 text-inherit rounded px-0.5">
        {text.slice(start, end + 1)}
      </mark>
    )
    last = end + 1
  })
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function useDebounced<T>(value: T, delay = 180) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function SearchBar({ products, query, setQuery, id = 'search', className }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listboxId = `${id}-listbox`
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<number>(-1)
  const [recents, setRecents] = useState<string[]>([])
  const debouncedQuery = useDebounced(query, 180)

  // Fuse instance mémoïsée
  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.3,
        ignoreLocation: true,
        includeMatches: true,
        minMatchCharLength: 2,
      }),
    [products]
  )

  // Résultats (avec matches pour <mark>)
  const results: FuseResult<Product>[] = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    return fuse.search(debouncedQuery, { limit: 8 }) as FuseResult<Product>[]
  }, [fuse, debouncedQuery])

  // Ouvrir/fermer la liste
  useEffect(() => {
    setOpen(Boolean(debouncedQuery.trim()) && results.length > 0)
    setHighlighted(results.length ? 0 : -1)
  }, [debouncedQuery, results.length])

  // Récupère recherches récentes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY)
      if (raw) setRecents(JSON.parse(raw))
    } catch {}
  }, [])

  const saveRecent = (value: string) => {
    try {
      const next = [value, ...recents.filter((q) => q.toLowerCase() !== value.toLowerCase())].slice(0, 8)
      setRecents(next)
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
    } catch {}
  }

  // Hotkeys: "/" et Ctrl/⌘+K pour focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)
      if (e.key === '/' || isCmdK) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Clic/touch extérieur pour fermer (handler typé Event → OK pour mousedown & touchstart)
  useEffect(() => {
    const onDown = (e: Event) => {
      const target = e.target as Node
      if (!inputRef.current) return
      const root = inputRef.current.closest('[data-search-root="true"]')
      if (root && !root.contains(target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown, { passive: true })
    document.addEventListener('touchstart', onDown, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDown as EventListener)
      document.removeEventListener('touchstart', onDown as EventListener)
    }
  }, [])

  const goToProduct = (slug: string, title?: string) => {
    setOpen(false)
    saveRecent(query)
    try {
      gaEvent?.({ action: 'search_select', category: 'search', label: title || slug, value: 1 })
      logEvent?.('search_select', { query, slug })
    } catch {}
    router.push(`/produit/${slug}`)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (highlighted >= 0 && results[highlighted]) {
      const p = results[highlighted].item
      goToProduct(p.slug, p.title)
      return
    }
    if (results[0]) {
      const p = results[0].item
      goToProduct(p.slug, p.title)
      return
    }
    // fallback : page catalogue filtrée
    saveRecent(query)
    try {
      gaEvent?.({ action: 'search_submit', category: 'search', label: query, value: results.length })
      logEvent?.('search_submit', { query, count: results.length })
    } catch {}
    router.push(`/produit?search=${encodeURIComponent(query.trim())}`)
    setOpen(false)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open && results.length) setOpen(true)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => (h + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => (h - 1 + results.length) % results.length)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showRecents = !query.trim() && recents.length > 0
  const activeDescId = highlighted >= 0 ? `${listboxId}-opt-${highlighted}` : undefined

  return (
    <div
      data-search-root="true"
      className={cn('relative w-full max-w-xl mx-auto', className)}
      role="search"
    >
      <form onSubmit={onSubmit} role="searchbox" aria-label="Recherche produits">
        <div className="relative">
          {/* Icône loupe */}
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <span aria-hidden>🔍</span>
          </div>

          <input
            ref={inputRef}
            id={id}
            name="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length || showRecents) setOpen(true)
            }}
            onKeyDown={onKeyDown}
            placeholder="Rechercher un produit…  /  Ctrl/⌘+K"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={open}
            // on ne passe l’attribut que s’il existe → évite l’erreur TS
            {...(activeDescId ? { 'aria-activedescendant': activeDescId } : {})}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-10 py-2.5 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent transition"
          />

          {/* Bouton clear */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setOpen(showRecents)
                inputRef.current?.focus()
              }}
              aria-label="Effacer la recherche"
              className="absolute inset-y-0 right-2 my-1 px-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Dropdown : résultats / récents */}
      {(open || showRecents) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
          {results.length > 0 ? (
            <ul id={listboxId} role="listbox" className="max-h-80 overflow-auto py-1">
              {results.map((res, i) => {
                const p = res.item
                const active = i === highlighted
                return (
                  <li
                    key={p._id}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={active}
                    className={cn(
                      'cursor-pointer select-none px-3 py-2 text-sm flex items-center justify-between',
                      active ? 'bg-accent/10 text-accent' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    onMouseEnter={() => setHighlighted(i)}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => goToProduct(p.slug, p.title)}
                  >
                    <span className="truncate">{highlight(p.title ?? '', res.matches)}</span>
                    <span className="ml-3 text-xs text-gray-400 dark:text-gray-500 truncate max-w-[40%]">
                      {p.price != null
                        ? Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(p.price)
                        : ''}
                    </span>
                  </li>
                )
              })}
              <li className="border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    saveRecent(query)
                    router.push(`/produit?search=${encodeURIComponent(query.trim())}`)
                    setOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10"
                >
                  Voir plus de résultats pour « {query} »
                </button>
              </li>
            </ul>
          ) : showRecents ? (
            <div className="p-2">
              <p className="px-2 py-1 text-xs text-gray-500">Recherches récentes</p>
              <div className="flex flex-wrap gap-2 px-2 pb-2">
                {recents.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuery(q)
                      inputRef.current?.focus()
                      setOpen(true)
                    }}
                    className="rounded-full border px-2.5 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {q}
                  </button>
                ))}
                {recents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecents([])
                      try { localStorage.removeItem(RECENTS_KEY) } catch {}
                    }}
                    className="ml-auto text-xs text-gray-500 hover:underline"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-3 py-3 text-sm text-gray-500">Aucun résultat.</div>
          )}
        </div>
      )}
    </div>
  )
}
