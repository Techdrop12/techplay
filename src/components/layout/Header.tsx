// src/components/layout/Header.tsx — ULTIME++ (i18n switch FR/EN actif, mega-menu a11y, perf/UX/a11y)
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
import { getCategories } from '@/lib/categories'
import {
  SearchIcon as Search,
  FlameIcon as Flame,
  HeartIcon as Heart,
  CartIcon as Cart,
  UserIcon as User,
} from '@/components/ui/premium-icons'
import { LOCALE_COOKIE } from '@/i18n/config'
import { setLocaleCookie } from '@/lib/language'

/* ----------------------------- i18n strings ------------------------------ */
const STR = {
  fr: {
    nav: { categories: 'Catégories', products: 'Produits', wishlist: 'Wishlist', blog: 'Blog', contact: 'Contact' },
    headerNavAria: 'Navigation principale',
    searchAria: 'Recherche produits',
    searchHint: 'Raccourcis : « / » ou « Ctrl/⌘ K » pour rechercher.',
    placeholderPrefix: 'Rechercher… ex:',
    trends: ['écouteurs bluetooth', 'casque gaming', 'chargeur rapide USB-C', 'pack starter', 'power bank', 'souris sans fil'],
    deals: { text: 'Offres', title: 'Offres du jour', aria: "Voir les offres du jour" },
    selection: 'Sélection',
    packsTitle: 'Packs recommandés',
    packsDesc: 'Les meilleures combinaisons pour booster ton setup.',
    viewPacks: 'Voir les packs',
    allProducts: 'Tous les produits',
    wishlistAria: (n: number) => (n > 0 ? `Voir la wishlist (${n})` : 'Voir la wishlist'),
    cartAria: (n: number) => (n > 0 ? `Voir le panier (${n})` : 'Voir le panier'),
    account: { aria: 'Espace client', title: 'Espace client' },
    headerAria: 'En-tête du site',
    logoAria: 'TechPlay — Accueil',
    srCountCart: 'Articles dans le panier : ',
    srCountWish: 'Articles dans la wishlist : ',
    localeSwitchAria: 'Sélecteur de langue',
  },
  en: {
    nav: { categories: 'Categories', products: 'Products', wishlist: 'Wishlist', blog: 'Blog', contact: 'Contact' },
    headerNavAria: 'Primary navigation',
    searchAria: 'Product search',
    searchHint: 'Shortcuts: “/” or “Ctrl/⌘ K” to search.',
    placeholderPrefix: 'Search… e.g.',
    trends: ['bluetooth earbuds', 'gaming headset', 'USB-C fast charger', 'starter pack', 'power bank', 'wireless mouse'],
    deals: { text: 'Deals', title: "Today's deals", aria: "See today's deals" },
    selection: 'Featured',
    packsTitle: 'Recommended packs',
    packsDesc: 'Best combos to boost your setup.',
    viewPacks: 'View packs',
    allProducts: 'All products',
    wishlistAria: (n: number) => (n > 0 ? `View wishlist (${n})` : 'View wishlist'),
    cartAria: (n: number) => (n > 0 ? `View cart (${n})` : 'View cart'),
    account: { aria: 'Account', title: 'Account' },
    headerAria: 'Site header',
    logoAria: 'TechPlay — Home',
    srCountCart: 'Items in cart: ',
    srCountWish: 'Items in wishlist: ',
    localeSwitchAria: 'Language selector',
  },
} as const

type NavLink = { href: string; labelKey: keyof typeof STR['fr']['nav'] }

const LINKS: NavLink[] = [
  { href: '/categorie', labelKey: 'categories' },
  { href: '/products', labelKey: 'products' },
  { href: '/wishlist', labelKey: 'wishlist' },
  { href: '/blog', labelKey: 'blog' },
  { href: '/contact', labelKey: 'contact' },
]

const SCROLL_HIDE_OFFSET = 80
const HOVER_PREFETCH_DELAY = 120

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

/** Sélecteur de langue FR/EN (persiste NEXT_LOCALE + navigation localisée) */
function LocaleSwitch({ pathname }: { pathname: string }) {
  const router = useRouter()
  const locale = getCurrentLocale(pathname) as 'fr' | 'en'
  const aria = STR[locale].localeSwitchAria
  const setLang = (newLocale: 'fr' | 'en') => {
    if (newLocale === locale) return
    try {
      document.cookie = `${LOCALE_COOKIE}=${newLocale}; Max-Age=31536000; Path=/; SameSite=Lax`
      setLocaleCookie(newLocale)
    } catch {}
    const next = localizePath(pathname, newLocale, { keepQuery: true, keepHash: true })
    router.replace(next)
  }

  return (
    <div
      role="group"
      aria-label={aria}
      className="inline-flex items-center rounded-full border border-token-border bg-token-surface/60 p-0.5"
    >
      {(['fr', 'en'] as const).map((l) => {
        const active = locale === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            disabled={active}
            aria-pressed={active}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'px-2.5 py-1.5 text-xs font-semibold rounded-full transition outline-none focus:ring-2',
              active
                ? 'bg-blue-600 text-white cursor-default focus:ring-blue-400'
                : 'bg-transparent text-token-text hover:opacity-90 focus:ring-blue-400'
            )}
            title={l === 'fr' ? 'Français' : 'English'}
          >
            {l.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}

export default function Header() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const locale = getCurrentLocale(pathname) as 'fr' | 'en'
  const t = STR[locale]
  const L = (p: string) => localizePath(p, locale)
  const SEARCH_ACTION = L('/products')

  // catégories i18n
  const categories = useMemo(() => getCategories(locale), [locale])

  // stores
  const { cart } = useCart() as any
  const { wishlist } = useWishlist() as any

  const cartCount = useMemo(() => {
    if (Array.isArray(cart)) return cart.reduce((tot: number, it: any) => tot + (it?.quantity || 1), 0)
    if (Array.isArray(cart?.items)) return cart.items.reduce((tot: number, it: any) => tot + (it?.quantity || 1), 0)
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

  // tendances recherche i18n
  const trends: string[] = useMemo(() => [...(STR[locale].trends as readonly string[])], [locale])
  const [placeholder, setPlaceholder] = useState<string>(() => trends[0] ?? '')
  const saveData = useRef<boolean>(false)

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
      const tEl = e.target as HTMLElement
      if (catPanelRef.current?.contains(tEl) || catBtnRef.current?.contains(tEl)) return
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
    // Data Saver → pas de prefetch agressif
    try {
      const conn = (navigator as any)?.connection
      saveData.current = !!conn?.saveData
    } catch {}
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

  // placeholder tournant
  useEffect(() => {
    setPlaceholder(trends[0] ?? '')
    let i = 0
    const id = window.setInterval(() => {
      i = (i + 1) % trends.length
      setPlaceholder(trends[i] ?? '')
    }, 4000)
    return () => clearInterval(id)
  }, [trends])

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
    if (saveData.current) return
    try {
      router.prefetch?.(href)
      const el = document.createElement('link')
      el.rel = 'prefetch'
      el.href = href
      document.head.appendChild(el)
      setTimeout(() => el.remove(), 5000)
    } catch {}
  }

  const smartPrefetchStart = (href: string) => {
    if (saveData.current) return
    const target = L(href)
    if (!target || isActive(href)) return
    if (prefetchTimers.current.has(target)) return
    const tmo = window.setTimeout(() => {
      prefetchViaLink(target)
      prefetchTimers.current.delete(target)
    }, HOVER_PREFETCH_DELAY)
    prefetchTimers.current.set(target, tmo)
  }
  const smartPrefetchCancel = (href: string) => {
    const target = L(href)
    const tmo = prefetchTimers.current.get(target)
    if (tmo) { clearTimeout(tmo); prefetchTimers.current.delete(target) }
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
    if (e.metaKey || e.ctrlKey || e.button === 1) return
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
      aria-label={t.headerAria}
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
          aria-label={t.logoAria}
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
          aria-label={t.searchAria}
          onSubmit={onSearchSubmit}
          className="relative hidden md:flex min-w-0 flex-1 items-center lg:max-w-md xl:max-w-lg"
        >
          {/* label accessible lié à l'input */}
          <label htmlFor="header-search" className="sr-only">
            {t.searchAria}
          </label>

          <input
            ref={searchRef}
            id="header-search"
            type="search"
            name="q"
            placeholder={`${t.placeholderPrefix} ${placeholder}`}
            list="header-search-suggestions"
            className={cn(
              'w-full rounded-full border px-4 py-2.5 pr-12 text-sm',
              'border-token-border bg-token-surface/70 placeholder:text-token-text/40',
              'focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.30)]'
            )}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="search"
            aria-keyshortcuts="/ Control+K Meta+K"
            aria-controls="search-status"
            aria-describedby="search-hint"
          />
          <datalist id="header-search-suggestions">
            {trends.map((s) => (<option value={s} key={s} />))}
          </datalist>
          <div id="search-hint" className="sr-only">{t.searchHint}</div>
          <div id="search-status" aria-live="polite" aria-atomic="true" className="sr-only" />
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            <button
              type="submit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              aria-label={t.searchAria}
              title={t.searchAria}
              data-gtm="header_search_submit"
            >
              <Search />
            </button>
          </div>
        </form>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex gap-5 xl:gap-7 tracking-tight font-medium text-token-text text-[15px] xl:text-base whitespace-nowrap"
          aria-label={t.headerNavAria}
        >
          {LINKS.map(({ href, labelKey }) => {
            const label = t.nav[labelKey]
            const active = isActive(href)

            if (labelKey === 'categories') {
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
                    {label}
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
                    aria-hidden={catOpen ? 'false' : 'true'}
                    tabIndex={catOpen ? 0 : -1}
                  >
                    <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-3 md:p-4">
                      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:col-span-2 md:gap-3" role="none">
                        {categories.map((c) => (
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
                          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--accent)/.90)]">{t.selection}</p>
                          <h3 className="mt-1 text-lg font-extrabold">{t.packsTitle}</h3>
                          <p className="mt-2 text-sm text-token-text/70">{t.packsDesc}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href="/products/packs"
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart('/products/packs')}
                              onPointerLeave={() => smartPrefetchCancel('/products/packs')}
                              onFocus={() => smartPrefetchStart('/products/packs')}
                              onBlur={() => smartPrefetchCancel('/products/packs')}
                              role="menuitem"
                              className="inline-flex items-center rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-[hsl(var(--accent)/.92)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]"
                            >
                              {t.viewPacks}
                            </Link>
                            <Link
                              href="/products"
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart('/products')}
                              onPointerLeave={() => smartPrefetchCancel('/products')}
                              onFocus={() => smartPrefetchStart('/products')}
                              onBlur={() => smartPrefetchCancel('/products')}
                              role="menuitem"
                              className="inline-flex items-center rounded-lg border border-token-border bg-token-surface px-3 py-1.5 text-sm font-semibold hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.30)]"
                            >
                              {t.allProducts}
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
                data-gtm={'header_nav_' + labelKey}
              >
                {label}
                {!active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions droites */}
        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <ThemeToggle size="sm" />
          <LocaleSwitch pathname={pathname} />

          {/* Offres compact */}
          <Link
            href="/products?promo=1"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/products?promo=1')}
            onPointerLeave={() => smartPrefetchCancel('/products?promo=1')}
            onFocus={() => smartPrefetchStart('/products?promo=1')}
            onBlur={() => smartPrefetchCancel('/products?promo=1')}
            className="xl:hidden inline-flex items-center justify-center p-0.5 rounded-lg hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)]"
            aria-label={t.deals.aria}
            title={t.deals.title}
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
            aria-label={t.deals.aria}
            title={t.deals.title}
            data-gtm="header_deals"
          >
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500" />
            </span>
            <span>{t.deals.text}</span>
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
              aria-label={t.wishlistAria(wishlistCount)}
              data-gtm="header_wishlist"
            >
              <ActionBadge><Heart /></ActionBadge>
            </Link>
            {wishlistCount > 0 && (
              <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
                <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  <span className="sr-only">{t.srCountWish}</span>{wishlistCount}
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
              aria-label={t.cartAria(cartCount)}
              data-gtm="header_cart"
              data-cart-icon
            >
              <ActionBadge><Cart /></ActionBadge>
            </Link>
            {cartCount > 0 && (
              <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
                <span className="animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  <span className="sr-only">{t.srCountCart}</span>{cartCount}
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
            aria-label={t.account.aria}
            title={t.account.title}
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
