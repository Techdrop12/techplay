// src/components/layout/Header.tsx — Ultra Premium FINAL++
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
  { href: '/categorie', label: 'Catégories' }, // mégamenu
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

const SCROLL_HIDE_OFFSET = 80
const HOVER_PREFETCH_DELAY = 120
const SEARCH_ACTION = '/produit'

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
  const pathname = usePathname() || '/'
  const router = useRouter()

  // Comptages robustes
  let cartCount = 0
  try {
    const { cart } = useCart() as any
    cartCount = Array.isArray(cart)
      ? cart.reduce((t: number, it: any) => t + (it?.quantity || 1), 0)
      : Array.isArray(cart?.items)
      ? cart.items.reduce((t: number, it: any) => t + (it?.quantity || 1), 0)
      : Number(cart?.count ?? cart?.size ?? 0) || 0
  } catch {}

  let wishlistCount = 0
  try {
    const { wishlist } = useWishlist() as any
    wishlistCount = Array.isArray(wishlist)
      ? wishlist.length
      : Array.isArray(wishlist?.items)
      ? wishlist.items.length
      : Number(wishlist?.count ?? wishlist?.size ?? 0) || 0
  } catch {}

  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const lastY = useRef(0)
  const ticking = useRef(false)
  const reducedMotion = useRef(false)
  const prefetchTimers = useRef<Map<string, number>>(new Map())

  const searchRef = useRef<HTMLInputElement | null>(null)
  const [placeholder, setPlaceholder] = useState(SEARCH_TRENDS[0])
  const [searchFocused, setSearchFocused] = useState(false)

  // Mega menu
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

  // Hotkeys: "/" ou Ctrl/Cmd+K → focus recherche
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const editable =
        tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable
      const cmdK = e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)
      const slash = e.key === '/'
      if (!editable && (cmdK || slash)) {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
      if (e.key === 'Escape' && searchRef.current === document.activeElement) {
        (e.target as HTMLInputElement)?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Placeholder rotatif (pause quand input focus)
  useEffect(() => {
    let i = 0
    let id: number | null = null
    const start = () => {
      if (id) return
      id = window.setInterval(() => {
        i = (i + 1) % SEARCH_TRENDS.length
        setPlaceholder(SEARCH_TRENDS[i])
      }, 4000)
    }
    const stop = () => { if (id) { clearInterval(id); id = null } }

    if (!searchFocused) start()
    else stop()

    return () => stop()
  }, [searchFocused])

  // Cleanup des timeouts de prefetch au unmount
  useEffect(() => {
    return () => {
      for (const t of prefetchTimers.current.values()) clearTimeout(t)
      prefetchTimers.current.clear()
      if (catTimer.current) clearTimeout(catTimer.current)
    }
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  // Prefetch “intelligent” au hover/focus (fallback si API router.prefetch absente)
  const prefetchViaLink = (href: string) => {
    try {
      const el = document.createElement('link')
      el.rel = 'prefetch'
      el.href = href
      document.head.appendChild(el)
      setTimeout(() => el.remove(), 5000)
    } catch {}
  }

  const smartPrefetchStart = (href: string) => {
    if (!href || isActive(href)) return
    if (document.visibilityState !== 'visible') return
    if (prefetchTimers.current.has(href)) return
    const t = window.setTimeout(() => {
      if (typeof router.prefetch === 'function') { try { router.prefetch(href) } catch {} }
      else prefetchViaLink(href)
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
        'fixed top-0 left-0 right-0 z-[80] w-full',
        'backdrop-blur supports-backdrop:bg-transparent',
        'border-b transition-all motion-safe:duration-300 motion-safe:ease-out motion-safe:transition-transform',
        scrolled
          ? 'bg-token-surface/85 border-token-border shadow-soft'
          : 'bg-token-surface/65 border-transparent',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="container-app flex h-16 md:h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          prefetch={false}
          aria-label="Retour à l’accueil"
          className="flex shrink-0 items-center gap-3 hocus:opacity-90"
          onFocus={() => smartPrefetchStart('/')}
          onBlur={() => smartPrefetchCancel('/')}
        >
          <Logo className="h-8 w-auto md:h-10" />
        </Link>

        {/* Recherche */}
        <form
          action={SEARCH_ACTION}
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
              'w-full rounded-full border px-4 py-2.5 pr-12 text-sm',
              'border-token-border bg-token-surface/70 placeholder:text-token-text/40',
              'focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.30)]'
            )}
            autoComplete="off"
            enterKeyHint="search"
            aria-keyshortcuts="/ Control+K Meta+K"
            aria-controls="search-status"
            aria-describedby="search-hint"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <datalist id="header-search-suggestions">
            {SEARCH_TRENDS.map((s) => (<option value={s} key={s} />))}
          </datalist>
          <div id="search-hint" className="sr-only">
            Raccourcis : « / » ou « Ctrl/⌘ K » pour rechercher.
          </div>
          <div id="search-status" aria-live="polite" aria-atomic="true" className="sr-only" />
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <button
              type="submit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              aria-label="Lancer la recherche"
              title="Rechercher"
              data-gtm="header_search_submit"
            >
              🔎
            </button>
          </div>
        </form>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex gap-6 lg:gap-8 tracking-tight font-medium text-token-text"
          aria-label="Navigation principale"
        >
          {LINKS.map(({ href, label }) => {
            const active = isActive(href)

            if (label === 'Catégories') {
              return (
                <div
                  key="mega-cats"
                  className="relative"
                  onMouseEnter={openCats}
                  onMouseLeave={() => closeCats()}
                >
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
                      'relative transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded-sm px-0.5',
                      active
                        ? 'text-[hsl(var(--accent))] font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[hsl(var(--accent))]'
                        : 'hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]'
                    )}
                    data-gtm="header_mega_btn"
                  >
                    Catégories
                    {!active && (
                      <span
                        className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  <div
                    ref={catPanelRef}
                    id={catPanelId}
                    role="menu"
                    aria-labelledby={catBtnId}
                    className={cn(
                      'absolute left-1/2 top-[calc(100%+10px)] z-50 w-[min(860px,92vw)] -translate-x-1/2 rounded-2xl border',
                      'border-token-border bg-token-surface/90 shadow-2xl backdrop-blur supports-backdrop:bg-token-surface/80',
                      'transition-all duration-200',
                      catOpen ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'
                    )}
                    onFocus={openCats}
                    onBlur={() => closeCats(80)}
                  >
                    <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-3 md:p-4">
                      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:col-span-2 md:gap-3" role="none">
                        {CATEGORIES.map((c) => (
                          <li key={c.href} role="none">
                            <Link
                              role="menuitem"
                              href={c.href}
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart(c.href)}
                              onPointerLeave={() => smartPrefetchCancel(c.href)}
                              onFocus={() => smartPrefetchStart(c.href)}
                              onBlur={() => smartPrefetchCancel(c.href)}
                              className={cn(
                                'group flex items-center gap-3 rounded-xl border transform-gpu p-3 transition',
                                'border-transparent bg-token-surface/80 hover:bg-token-surface shadow-sm hover:shadow-md',
                                'hover:border-[hsl(var(--accent)/.30)] hover:-translate-y-0.5'
                              )}
                              data-gtm="header_mega_cat"
                            >
                              <span className="text-xl select-none" aria-hidden="true">{c.emoji}</span>
                              <span className="flex-1">
                                <span className="block text-sm font-semibold">{c.label}</span>
                                <span className="block text-xs text-token-text/60">{c.desc}</span>
                              </span>
                              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-50 group-hover:opacity-90" aria-hidden="true">
                                <path fill="currentColor" d="M9 18l6-6-6-6v12z" />
                              </svg>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="md:col-span-1">
                        <div className="h-full rounded-xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.10)] via-transparent to-token-surface p-4 md:p-5 shadow-md">
                          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--accent)/.90)]">Sélection</p>
                          <h3 className="mt-1 text-lg font-extrabold">Packs recommandés</h3>
                          <p className="mt-2 text-sm text-token-text/70">
                            Les meilleures combinaisons pour booster ton setup.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href="/pack"
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart('/pack')}
                              onPointerLeave={() => smartPrefetchCancel('/pack')}
                              onFocus={() => smartPrefetchStart('/pack')}
                              onBlur={() => smartPrefetchCancel('/pack')}
                              role="menuitem"
                              className="inline-flex items-center rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]"
                              data-gtm="header_mega_cta_packs"
                            >
                              Voir les packs
                            </Link>
                            <Link
                              href="/categorie"
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart('/categorie')}
                              onPointerLeave={() => smartPrefetchCancel('/categorie')}
                              onFocus={() => smartPrefetchStart('/categorie')}
                              onBlur={() => smartPrefetchCancel('/categorie')}
                              role="menuitem"
                              className="inline-flex items-center rounded-lg border border-token-border bg-token-surface px-3 py-1.5 text-sm font-semibold hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.30)]"
                              data-gtm="header_mega_cta_all"
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
                onFocus={() => smartPrefetchStart(href)}
                onBlur={() => smartPrefetchCancel(href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative group rounded-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
                  active
                    ? 'text-[hsl(var(--accent))] font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[hsl(var(--accent))]'
                    : 'hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]'
                )}
                data-gtm={'header_nav_' + label.toLowerCase()}
              >
                {label}
                {!active && (
                  <span
                    className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions droites */}
        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <ThemeToggle />

          <Link
            href="/promo"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/promo')}
            onPointerLeave={() => smartPrefetchCancel('/promo')}
            onFocus={() => smartPrefetchStart('/promo')}
            onBlur={() => smartPrefetchCancel('/promo')}
            className="group inline-flex items-center gap-2 rounded-full border border-token-border bg-token-surface/60 px-3 py-1.5 text-sm font-medium text-token-text hover:bg-token-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-label="Voir les offres du jour"
            title="Offres du jour"
            data-gtm="header_deals"
          >
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500" />
            </span>
            <span className="hidden lg:inline">Offres</span>
          </Link>

          <div className="relative">
            <Link
              href="/wishlist"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/wishlist')}
              onPointerLeave={() => smartPrefetchCancel('/wishlist')}
              onFocus={() => smartPrefetchStart('/wishlist')}
              onBlur={() => smartPrefetchCancel('/wishlist')}
              className="relative text-token-text hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              aria-label={
                wishlistCount > 0
                  ? `Voir la wishlist (${wishlistCount} article${wishlistCount > 1 ? 's' : ''})`
                  : 'Voir la wishlist'
              }
              data-gtm="header_wishlist"
            >
              <span className="sr-only">Wishlist</span>
              <span className="text-2xl" aria-hidden="true">🤍</span>
            </Link>
            <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
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
              onFocus={() => smartPrefetchStart('/commande')}
              onBlur={() => smartPrefetchCancel('/commande')}
              className="relative text-token-text hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              aria-label={
                cartCount > 0
                  ? `Voir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`
                  : 'Voir le panier'
              }
              data-gtm="header_cart"
            >
              <span className="sr-only">Panier</span>
              <span className="text-2xl" aria-hidden="true">🛒</span>
            </Link>
            <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
              {cartCount > 0 && (
                <span className="animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
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
            onFocus={() => smartPrefetchStart('/login')}
            onBlur={() => smartPrefetchCancel('/login')}
            className="hidden lg:inline-flex items-center justify-center rounded-full border border-transparent px-3 py-2 text-sm font-medium text-token-text hover:text-[hsl(var(--accent))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            aria-label="Espace client"
            title="Espace client"
            data-gtm="header_account"
          >
            👤
          </Link>
        </div>

        {/* Bouton + panel mobile (géré dans MobileNav) */}
        <MobileNav />
      </div>

      {/* Liseré subtil */}
      <div aria-hidden className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-[hsl(var(--accent)/.40)] to-transparent" />
    </header>
  )
}
