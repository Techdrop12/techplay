// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '../Logo'
import MobileNav from './MobileNav'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import ThemeToggle from '@/components/ui/ThemeToggle'

type NavLink = { href: string; label: string }

const LINKS: NavLink[] = [
  { href: '/', label: 'Accueil' },
  { href: '/categorie', label: 'Catégories' }, // mega menu
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const SCROLL_HIDE_OFFSET = 80
const HOVER_PREFETCH_DELAY = 120

const SEARCH_TRENDS = [
  'écouteurs bluetooth',
  'casque gaming',
  'chargeur rapide USB-C',
  'pack starter',
  'power bank',
  'souris sans fil',
]

const CATEGORIES: Array<{ label: string; href: string; emoji: string; desc: string }> = [
  { label: 'Casques', href: '/categorie/casques', emoji: '🎧', desc: 'Audio immersif' },
  { label: 'Claviers', href: '/categorie/claviers', emoji: '⌨️', desc: 'Mécas & low-profile' },
  { label: 'Souris', href: '/categorie/souris', emoji: '🖱️', desc: 'Précision & confort' },
  { label: 'Webcams', href: '/categorie/webcams', emoji: '📷', desc: 'Visio en HD' },
  { label: 'Batteries', href: '/categorie/batteries', emoji: '🔋', desc: 'Power & hubs' },
  { label: 'Audio', href: '/categorie/audio', emoji: '🔊', desc: 'Enceintes & DAC' },
  { label: 'Stockage', href: '/categorie/stockage', emoji: '💾', desc: 'SSD & cartes' },
  { label: 'Écrans', href: '/categorie/ecrans', emoji: '🖥️', desc: '144Hz et +' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  let cartCount = 0
  try {
    const { cart } = useCart()
    cartCount = Array.isArray(cart) ? cart.reduce((t, it: any) => t + (it?.quantity || 1), 0) : 0
  } catch {}

  let wishlistCount = 0
  try {
    const { wishlist } = useWishlist() as any
    wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0
  } catch {}

  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const lastY = useRef(0)
  const ticking = useRef(false)
  const reducedMotion = useRef(false)
  const prefetchTimers = useRef<Map<string, number>>(new Map())

  const searchRef = useRef<HTMLInputElement | null>(null)
  const [placeholder, setPlaceholder] = useState(SEARCH_TRENDS[0])

  const [catOpen, setCatOpen] = useState(false)
  const catBtnRef = useRef<HTMLButtonElement | null>(null)
  const catPanelRef = useRef<HTMLDivElement | null>(null)
  const catTimer = useRef<number | null>(null)
  const catBtnId = useId()
  const catPanelId = useId()

  const openCats = () => {
    if (catTimer.current) { clearTimeout(catTimer.current); catTimer.current = null }
    setCatOpen(true)
  }
  const closeCats = (delay = 80) => {
    if (catTimer.current) { clearTimeout(catTimer.current); catTimer.current = null }
    catTimer.current = window.setTimeout(() => setCatOpen(false), delay) as unknown as number
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!catOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        setCatOpen(false)
        catBtnRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [catOpen])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!catOpen) return
      const t = e.target as HTMLElement
      if (catPanelRef.current?.contains(t) || catBtnRef.current?.contains(t)) return
      setCatOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [catOpen])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reducedMotion.current = !!mq?.matches
    const onChange = () => {
      reducedMotion.current = !!mq?.matches
      if (reducedMotion.current) setHidden(false)
    }
    mq?.addEventListener?.('change', onChange)
    return () => mq?.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(() => {
        setScrolled(y > 2)
        if (!reducedMotion.current) setHidden(y > lastY.current && y > SCROLL_HIDE_OFFSET)
        else setHidden(false)
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const editable =
        tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable
      const cmdK = (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))
      const slash = e.key === '/'
      if (!editable && (cmdK || slash)) {
        e.preventDefault()
        const el = searchRef.current
        el?.focus()
        el?.select()
      }
      if (e.key === 'Escape' && searchRef.current === document.activeElement) {
        (e.target as HTMLInputElement)?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % SEARCH_TRENDS.length
      setPlaceholder(SEARCH_TRENDS[i])
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const isActive = (href: string) => (pathname ? pathname === href || pathname.startsWith(href + '/') : false)

  const smartPrefetchStart = (href: string) => {
    if (!href || isActive(href)) return
    if (prefetchTimers.current.has(href)) return
    const t = window.setTimeout(() => {
      try { router.prefetch(href) } catch {}
      prefetchTimers.current.delete(href)
    }, HOVER_PREFETCH_DELAY)
    prefetchTimers.current.set(href, t)
  }
  const smartPrefetchCancel = (href: string) => {
    const t = prefetchTimers.current.get(href)
    if (t) { clearTimeout(t); prefetchTimers.current.delete(href) }
  }

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const data = new FormData(form)
    const q = String(data.get('q') || '').trim()
    if (!q) {
      e.preventDefault()
      searchRef.current?.focus()
      return
    }
    try { localStorage.setItem('last:q', q) } catch {}
  }

  return (
    <header
      role="banner"
      aria-label="En-tête du site"
      data-hidden={hidden ? 'true' : 'false'}
      data-scrolled={scrolled ? 'true' : 'false'}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full',
        'supports-[backdrop-filter]:backdrop-blur-md backdrop-saturate-150',
        'border-b transition-all',
        'motion-safe:duration-300 motion-safe:ease-out motion-safe:transition-transform motion-reduce:transition-none',
        scrolled
          ? 'bg-white/95 border-gray-200 dark:bg-black/80 dark:border-gray-800 shadow-[0_6px_30px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)]'
          : 'bg-white/70 border-transparent dark:bg-black/60',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" prefetch={false} aria-label="Retour à l’accueil" className="flex shrink-0 items-center gap-3">
          <Logo className="h-8 w-auto md:h-10" />
        </Link>

        <form
          action="/products"
          method="get"
          role="search"
          aria-label="Recherche produits"
          onSubmit={onSearchSubmit}
          className="relative hidden min-w-[260px] max-w-sm flex-1 items-center md:flex"
        >
          <input
            ref={searchRef}
            type="search"
            name="q"
            placeholder={`Rechercher… ex: ${placeholder}`}
            list="header-search-suggestions"
            className={cn(
              'w-full rounded-full border border-gray-300 bg-white/70 px-4 py-2.5 pr-12 text-sm',
              'placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30',
              'dark:border-gray-700 dark:bg-black/50 dark:placeholder:text-gray-500'
            )}
            autoComplete="off"
            enterKeyHint="search"
            aria-controls="search-status"
            aria-describedby="search-hint"
          />
          <datalist id="header-search-suggestions">
            {SEARCH_TRENDS.map((s) => (<option value={s} key={s} />))}
          </datalist>
          <div id="search-hint" className="sr-only">Raccourcis : « / » ou « Ctrl/⌘ K » pour rechercher.</div>
          <div id="search-status" aria-live="polite" aria-atomic="true" className="sr-only" />
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <button type="submit" className="inline-flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="Lancer la recherche" title="Rechercher">🔎</button>
          </div>
        </form>

        <nav className="hidden md:flex gap-6 lg:gap-8 tracking-tight font-medium text-gray-800 dark:text-gray-100" aria-label="Navigation principale">
          {LINKS.map(({ href, label }) => {
            const active = isActive(href)

            if (label === 'Catégories') {
              return (
                <div key="mega-cats" className="relative" onMouseEnter={openCats} onMouseLeave={() => closeCats()}>
                  <button
                    ref={catBtnRef}
                    id={catBtnId}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={catOpen}
                    aria-controls={catPanelId}
                    onClick={() => setCatOpen((v) => !v)}
                    onFocus={openCats}
                    onBlur={() => closeCats(80)}
                    className={cn(
                      'relative transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm px-0.5',
                      active
                        ? 'text-accent font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-accent'
                        : 'hover:text-accent focus-visible:text-accent'
                    )}
                  >
                    Catégories
                    {!active && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                    )}
                  </button>

                  <div
                    ref={catPanelRef}
                    id={catPanelId}
                    role="menu"
                    aria-labelledby={catBtnId}
                    className={cn(
                      'absolute left-1/2 top-[calc(100%+10px)] z-50 w-[min(860px,92vw)] -translate-x-1/2 rounded-2xl border',
                      'border-gray-200/80 bg-white/90 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-white/80',
                      'dark:border-gray-800/70 dark:bg-black/80',
                      'transition-all duration-200',
                      catOpen ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'
                    )}
                    onFocus={openCats}
                    onBlur={() => closeCats(80)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 md:p-4">
                      <ul className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3" role="none">
                        {CATEGORIES.map((c) => (
                          <li key={c.href} role="none">
                            <Link
                              role="menuitem"
                              href={c.href}
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart(c.href)}
                              onPointerLeave={() => smartPrefetchCancel(c.href)}
                              className={cn(
                                'group flex items-center gap-3 rounded-xl border border-transparent transform-gpu',
                                'bg-white/80 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900',
                                'hover:border-accent/30 hover:-translate-y-0.5 transition p-3 shadow-sm hover:shadow-md'
                              )}
                            >
                              <span className="text-xl select-none" aria-hidden="true">{c.emoji}</span>
                              <span className="flex-1">
                                <span className="block font-semibold text-sm">{c.label}</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">{c.desc}</span>
                              </span>
                              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-50 group-hover:opacity-90" aria-hidden="true">
                                <path fill="currentColor" d="M9 18l6-6-6-6v12z" />
                              </svg>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="md:col-span-1">
                        <div className="h-full rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gradient-to-br from-accent/10 via-transparent to-brand/10 p-4 md:p-5 shadow-md">
                          <p className="text-xs uppercase tracking-widest font-bold text-accent/90">Sélection</p>
                          <h3 className="mt-1 text-lg font-extrabold">Packs recommandés</h3>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Les meilleures combinaisons pour booster ton setup.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href="/pack"
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart('/pack')}
                              onPointerLeave={() => smartPrefetchCancel('/pack')}
                              role="menuitem"
                              className="inline-flex items-center rounded-lg bg-accent text-white px-3 py-1.5 text-sm font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            >
                              Voir les packs
                            </Link>
                            <Link
                              href="/categorie"
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart('/categorie')}
                              onPointerLeave={() => smartPrefetchCancel('/categorie')}
                              role="menuitem"
                              className="inline-flex items-center rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-semibold hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                            >
                              Toutes les catégories
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                onPointerEnter={() => smartPrefetchStart(href)}
                onPointerLeave={() => smartPrefetchCancel(href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
                  active
                    ? 'text-accent font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-accent'
                    : 'hover:text-accent focus-visible:text-accent'
                )}
              >
                {label}
                {!active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/promo"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/promo')}
            onPointerLeave={() => smartPrefetchCancel('/promo')}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300/80 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/50 px-3 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Voir les offres du jour"
            title="Offres du jour"
          >
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 opacity-60"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></span>
            </span>
            <span className="hidden lg:inline">Offres</span>
          </Link>

          <div className="relative">
            <Link
              href="/wishlist"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/wishlist')}
              onPointerLeave={() => smartPrefetchCancel('/wishlist')}
              className="relative text-gray-800 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:text-white"
              aria-label={wishlistCount > 0 ? `Voir la wishlist (${wishlistCount} article${wishlistCount > 1 ? 's' : ''})` : 'Voir la wishlist'}
            >
              <span className="sr-only">Wishlist</span>
              <span className="text-2xl" aria-hidden="true">🤍</span>
            </Link>
            <div aria-live="polite" aria-atomic="true" className="absolute -top-2 -right-2">
              {wishlistCount > 0 && (
                <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  <span className="sr-only">Articles dans la wishlist&nbsp;:</span>
                  {wishlistCount}
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <Link
              href="/commande"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/commande')}
              onPointerLeave={() => smartPrefetchCancel('/commande')}
              className="relative text-gray-800 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:text-white"
              aria-label={cartCount > 0 ? `Voir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})` : 'Voir le panier'}
            >
              <span className="sr-only">Panier</span>
              <span className="text-2xl" aria-hidden="true">🛒</span>
            </Link>
            <div aria-live="polite" aria-atomic="true" className="absolute -top-2 -right-2">
              {cartCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm animate-[pulse_2s_ease-in-out_infinite]">
                  <span className="sr-only">Articles dans le panier&nbsp;:</span>
                  {cartCount}
                </span>
              )}
            </div>
          </div>

          <Link
            href="/login"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/login')}
            onPointerLeave={() => smartPrefetchCancel('/login')}
            className="hidden lg:inline-flex items-center justify-center rounded-full border border-transparent px-3 py-2 text-sm font-medium text-gray-800 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent dark:text-gray-100"
            aria-label="Espace client"
            title="Espace client"
          >
            👤
          </Link>
        </div>

        <MobileNav />
      </div>

      <div aria-hidden className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </header>
  )
}
