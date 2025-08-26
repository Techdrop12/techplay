// src/components/layout/Header.tsx — Logo → Accueil garanti + icônes premium + a11y/perf — FINAL
'use client'

import NextLink from 'next/link' // logo
import Link from '@/components/LocalizedLink'
import { useEffect, useId, useRef, useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '../Logo'
import MobileNav from './MobileNav'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import { CATEGORIES } from '@/lib/categories'
import {
  SearchIcon as Search,
  FlameIcon as Flame,
  HeartIcon as Heart,
  CartIcon as Cart,
  UserIcon as User,
} from '@/components/ui/premium-icons'

type NavLink = { href: string; label: string }
const LINKS: NavLink[] = [
  { href: '/categorie', label: 'Catégories' },
  { href: '/products', label: 'Produits' },
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

/** Badge premium */
const ActionBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-xl',
      'bg-[radial-gradient(120%_120%_at_30%_20%,hsl(var(--accent)/.16),hsl(var(--accent)/.06)_45%,transparent_70%)]',
      'ring-1 ring-[hsl(var(--accent)/.22)] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]',
      className
    )}
  >
    {children}
  </span>
)

export default function Header() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const locale = getCurrentLocale(pathname)
  const L = (p: string) => localizePath(p, locale)
  const SEARCH_ACTION = L('/products')

  // stores
  const { cart } = useCart() as any
  const { wishlist } = useWishlist() as any

  const cartCount = useMemo(() => {
    if (Array.isArray(cart)) return cart.reduce((t: number, it: any) => t + (it?.quantity || 1), 0)
    if (Array.isArray(cart?.items)) return cart.items.reduce((t: number, it: any) => t + (it?.quantity || 1), 0)
    const n = Number(cart?.count ?? cart?.size ?? 0)
    return Number.isFinite(n) ? n : 0
  }, [cart])

  const wishlistCount = useMemo(() => {
    if (Array.isArray(wishlist)) return wishlist.length
    if (Array.isArray(wishlist?.items)) return wishlist.items.length
    const n = Number(wishlist?.count ?? wishlist?.size ?? 0)
    return Number.isFinite(n) ? n : 0
  }, [wishlist])

  // ui state
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)
  const reducedMotion = useRef(false)
  const prefetchTimers = useRef<Map<string, number>>(new Map())
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [placeholder, setPlaceholder] = useState(SEARCH_TRENDS[0])

  // mega menu
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

  // Hotkeys: "/" ou Ctrl/Cmd+K
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
        ;(e.target as HTMLInputElement)?.blur()
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

  useEffect(() => {
    return () => {
      prefetchTimers.current.forEach((t) => clearTimeout(t))
      prefetchTimers.current.clear()
    }
  }, [])

  const isActive = (href: string) => {
    const localized = L(href)
    return localized === pathname || pathname.startsWith(localized + '/')
  }

  const prefetchViaLink = (href: string) => {
    try {
      // Next/router prefetch (quand possible), sinon <link rel="prefetch">
      router.prefetch?.(href)
      const el = document.createElement('link')
      el.rel = 'prefetch'
      el.href = href
      document.head.appendChild(el)
      setTimeout(() => el.remove(), 5000)
    } catch {}
  }

  const smartPrefetchStart = (href: string) => {
    const target = L(href)
    if (!target || isActive(href)) return
    if (prefetchTimers.current.has(target)) return
    const t = window.setTimeout(() => {
      prefetchViaLink(target)
      prefetchTimers.current.delete(target)
    }, HOVER_PREFETCH_DELAY)
    prefetchTimers.current.set(target, t)
  }
  const smartPrefetchCancel = (href: string) => {
    const target = L(href)
    const t = prefetchTimers.current.get(target)
    if (t) { clearTimeout(t); prefetchTimers.current.delete(target) }
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

  /** LOGO → ACCUEIL (garanti) */
  const onLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) return // middle/Cmd click ok
    e.preventDefault()
    const url = L('/')
    try { router.push(url) } catch {}
    setTimeout(() => {
      try {
        if (window.location.pathname !== url) window.location.assign(url)
      } catch {}
    }, 80)
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
      <div className="container-app flex h-16 md:h-20 items-center justify-between gap-2 sm:gap-3">
        {/* Logo — clique → Accueil */}
        <NextLink
          href={L('/')}
          prefetch={false}
          aria-label="TechPlay — Accueil"
          rel="home"
          onClick={onLogoClick}
          className="group inline-flex items-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          data-gtm="header_logo_home"
        >
          <Logo
            className="h-8 w-auto md:h-10"
            withText={false}
            srcLight="/logo.svg"
            srcDark="/logo-dark.svg"
            ariaLabel="TechPlay"
          />
        </NextLink>

        {/* Recherche */}
        <form
          action={SEARCH_ACTION}
          method="get"
          role="search"
          aria-label="Recherche produits"
          onSubmit={onSearchSubmit}
          className="relative hidden md:flex min-w-0 flex-1 items-center lg:max-w-md xl:max-w-lg"
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
          />
          <datalist id="header-search-suggestions">
            {SEARCH_TRENDS.map((s) => (<option value={s} key={s} />))}
          </datalist>
          <div id="search-hint" className="sr-only">Raccourcis : « / » ou « Ctrl/⌘ K » pour rechercher.</div>
          <div id="search-status" aria-live="polite" aria-atomic="true" className="sr-only" />
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <button
              type="submit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              aria-label="Lancer la recherche"
              title="Rechercher"
              data-gtm="header_search_submit"
            >
              <Search />
            </button>
          </div>
        </form>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex gap-5 xl:gap-7 tracking-tight font-medium text-token-text text-[15px] xl:text-base whitespace-nowrap"
          aria-label="Navigation principale"
        >
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
                      'relative transition-colors duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] rounded-sm px-0.5',
                      active
                        ? 'text-[hsl(var(--accent))] font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[hsl(var(--accent))]'
                        : 'hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]'
                    )}
                    data-gtm="header_mega_btn"
                  >
                    Catégories
                    {!active && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full" aria-hidden="true" />
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
                              <c.Icon className="opacity-80" />
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
                          <p className="mt-2 text-sm text-token-text/70">Les meilleures combinaisons pour booster ton setup.</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link href="/products/packs" prefetch={false} onPointerEnter={() => smartPrefetchStart('/products/packs')} onPointerLeave={() => smartPrefetchCancel('/products/packs')} onFocus={() => smartPrefetchStart('/products/packs')} onBlur={() => smartPrefetchCancel('/products/packs')}
                              role="menuitem" className="inline-flex items-center rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]">
                              Voir les packs
                            </Link>
                            <Link href="/products" prefetch={false} onPointerEnter={() => smartPrefetchStart('/products')} onPointerLeave={() => smartPrefetchCancel('/products')} onFocus={() => smartPrefetchStart('/products')} onBlur={() => smartPrefetchCancel('/products')}
                              role="menuitem" className="inline-flex items-center rounded-lg border border-token-border bg-token-surface px-3 py-1.5 text-sm font-semibold hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.30)]">
                              Tous les produits
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
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions droites — badges premium */}
        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <ThemeToggle size="sm" />

          {/* Offres compact */}
          <Link
            href="/products?promo=1"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/products?promo=1')}
            onPointerLeave={() => smartPrefetchCancel('/products?promo=1')}
            onFocus={() => smartPrefetchStart('/products?promo=1')}
            onBlur={() => smartPrefetchCancel('/products?promo=1')}
            className="xl:hidden inline-flex items-center justify-center p-0.5 rounded-lg hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-label="Voir les offres du jour"
            title="Offres du jour"
            data-gtm="header_deals_icon"
          >
            <ActionBadge><Flame /></ActionBadge>
          </Link>

          {/* Offres bouton texte */}
          <Link
            href="/products?promo=1"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/products?promo=1')}
            onPointerLeave={() => smartPrefetchCancel('/products?promo=1')}
            onFocus={() => smartPrefetchStart('/products?promo=1')}
            onBlur={() => smartPrefetchCancel('/products?promo=1')}
            className="group hidden xl:inline-flex items-center gap-2 rounded-full border border-token-border bg-token-surface/60 px-3 py-1.5 text-sm font-medium text-token-text hover:bg-token-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-label="Voir les offres du jour"
            title="Offres du jour"
            data-gtm="header_deals"
          >
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500" />
            </span>
            <span>Offres</span>
          </Link>

          {/* Wishlist */}
          <div className="relative">
            <Link
              href="/wishlist"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/wishlist')}
              onPointerLeave={() => smartPrefetchCancel('/wishlist')}
              onFocus={() => smartPrefetchStart('/wishlist')}
              onBlur={() => smartPrefetchCancel('/wishlist')}
              className="relative hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded-lg p-0.5"
              aria-label={wishlistCount > 0 ? `Voir la wishlist (${wishlistCount})` : 'Voir la wishlist'}
              data-gtm="header_wishlist"
            >
              <ActionBadge><Heart /></ActionBadge>
            </Link>
            {wishlistCount > 0 && (
              <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
                <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  {wishlistCount}
                </span>
              </div>
            )}
          </div>

          {/* Panier */}
          <div className="relative">
            <Link
              href="/commande"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/commande')}
              onPointerLeave={() => smartPrefetchCancel('/commande')}
              onFocus={() => smartPrefetchStart('/commande')}
              onBlur={() => smartPrefetchCancel('/commande')}
              className="relative hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded-lg p-0.5"
              aria-label={cartCount > 0 ? `Voir le panier (${cartCount})` : 'Voir le panier'}
              data-gtm="header_cart"
            >
              <ActionBadge><Cart /></ActionBadge>
            </Link>
            {cartCount > 0 && (
              <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
                <span className="animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              </div>
            )}
          </div>

          {/* Compte */}
          <Link
            href="/login"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/login')}
            onPointerLeave={() => smartPrefetchCancel('/login')}
            onFocus={() => smartPrefetchStart('/login')}
            onBlur={() => smartPrefetchCancel('/login')}
            className="hidden xl:inline-flex items-center justify-center rounded-lg p-0.5 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
            aria-label="Espace client"
            title="Espace client"
            data-gtm="header_account"
          >
            <ActionBadge><User /></ActionBadge>
          </Link>
        </div>

        {/* Menu mobile */}
        <MobileNav />
      </div>

      {/* Liseré subtil */}
      <div aria-hidden className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-[hsl(var(--accent)/.40)] to-transparent" />
    </header>
  )
}
