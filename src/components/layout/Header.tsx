'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'

import Logo from '../Logo'

import MobileNav from './MobileNav'

import Link from '@/components/LocalizedLink'
import {
  CartIcon as Cart,
  HeartIcon as Heart,
  SearchIcon as Search,
  UserIcon as User,
} from '@/components/ui/premium-icons'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { getCategories } from '@/lib/categories'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import { LOCALE_COOKIE, setLocaleCookie } from '@/lib/language'
import { cn } from '@/lib/utils'

const STR = {
  fr: {
    nav: {
      categories: 'Catégories',
      products: 'Tous les produits',
      packs: 'Packs recommandés',
      wishlist: 'Wishlist',
      blog: 'Blog',
      contact: 'Support & contact',
    },
    headerNavAria: 'Navigation principale',
    searchAria: 'Recherche produits',
    searchHint: 'Raccourcis : « / » ou « Ctrl/⌘ K » pour rechercher.',
    placeholderPrefix: 'Rechercher… ex :',
    trends: [
      'écouteurs bluetooth',
      'casque gaming',
      'chargeur rapide USB-C',
      'pack starter',
      'power bank',
      'souris sans fil',
    ],
    selection: 'Sélection',
    packsTitle: 'Packs recommandés',
    packsDesc: 'Les meilleures combinaisons pour booster ton setup.',
    viewPacks: 'Voir les packs',
    allProducts: 'Tous les produits',
    wishlistAria: (n: number) => (n > 0 ? `Voir la wishlist (${n})` : 'Voir la wishlist'),
    cartAria: (n: number) => (n > 0 ? `Voir le panier (${n})` : 'Voir le panier'),
    cartShort: 'Panier',
    account: {
      aria: 'Espace client',
      title: 'Espace client',
    },
    headerAria: 'En-tête du site',
    logoAria: 'TechPlay — Accueil',
    localeSwitcherAria: 'Sélecteur de langue',
  },
  en: {
    nav: {
      categories: 'Categories',
      products: 'All products',
      packs: 'Packs',
      wishlist: 'Wishlist',
      blog: 'Blog',
      contact: 'Support & contact',
    },
    headerNavAria: 'Primary navigation',
    searchAria: 'Product search',
    searchHint: 'Shortcuts: “/” or “Ctrl/⌘ K” to search.',
    placeholderPrefix: 'Search… e.g.:',
    trends: [
      'bluetooth earbuds',
      'gaming headset',
      'USB-C fast charger',
      'starter pack',
      'power bank',
      'wireless mouse',
    ],
    selection: 'Featured',
    packsTitle: 'Recommended packs',
    packsDesc: 'Best combos to boost your setup.',
    viewPacks: 'View packs',
    allProducts: 'All products',
    wishlistAria: (n: number) => (n > 0 ? `View wishlist (${n})` : 'View wishlist'),
    cartAria: (n: number) => (n > 0 ? `View cart (${n})` : 'View cart'),
    cartShort: 'Cart',
    account: {
      aria: 'Account',
      title: 'Account',
    },
    headerAria: 'Site header',
    logoAria: 'TechPlay — Home',
    localeSwitcherAria: 'Language selector',
  },
} as const

type NavLink = {
  href: string
  labelKey: keyof typeof STR.fr.nav
}

type CartItemLike = {
  quantity?: number
}

type CartCollection =
  | CartItemLike[]
  | { items?: CartItemLike[]; count?: number; size?: number }
  | undefined

type WishlistCollection =
  | unknown[]
  | { items?: unknown[]; count?: number; size?: number }
  | undefined

type CartStoreLike = {
  cart?: CartCollection
}

type WishlistStoreLike = {
  wishlist?: WishlistCollection
}

const LINKS: NavLink[] = [
  { href: '/categorie', labelKey: 'categories' },
  { href: '/blog', labelKey: 'blog' },
  { href: '/contact', labelKey: 'contact' },
]

const SCROLL_HIDE_OFFSET = 80
const HOVER_PREFETCH_DELAY = 120
const PLACEHOLDER_MS = 4000

function ActionBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
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
}

function getCartCount(cart: CartCollection): number {
  if (Array.isArray(cart)) {
    return cart.reduce((total, item) => {
      const quantity = Number(item?.quantity ?? 1)
      return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
    }, 0)
  }

  if (cart && Array.isArray(cart.items)) {
    return cart.items.reduce((total, item) => {
      const quantity = Number(item?.quantity ?? 1)
      return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
    }, 0)
  }

  const count = Number(cart?.count ?? cart?.size ?? 0)
  return Number.isFinite(count) ? count : 0
}

function getWishlistCount(wishlist: WishlistCollection): number {
  if (Array.isArray(wishlist)) return wishlist.length
  if (wishlist && Array.isArray(wishlist.items)) return wishlist.items.length

  const count = Number(wishlist?.count ?? wishlist?.size ?? 0)
  return Number.isFinite(count) ? count : 0
}

function LocaleSwitch({ pathname }: { pathname: string }) {
  const router = useRouter()
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'
  const t = STR[locale]

  const setLang = (nextLocale: 'fr' | 'en') => {
    if (nextLocale === locale) return

    try {
      const secure =
        typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(nextLocale)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
      setLocaleCookie(nextLocale)
    } catch {
      // no-op
    }

    router.replace(localizePath(pathname, nextLocale))
  }

  const labels = { fr: 'FR', en: 'EN' } as const
  const nextLocale = locale === 'fr' ? 'en' : 'fr'

  return (
    <div
      role="group"
      aria-label={t.localeSwitcherAria}
      className="inline-flex items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/70 p-0.5 shadow-sm"
    >
      <button
        type="button"
        onClick={() => setLang(nextLocale)}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={locale === 'fr' ? 'Passer en anglais' : 'Switch to French'}
        aria-current="true"
        className="min-w-[2rem] rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition outline-none focus:ring-2 focus:ring-offset-1 bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] hover:opacity-95 focus:ring-[hsl(var(--accent)/.5)]"
        title={locale === 'fr' ? 'Passer en anglais' : 'Switch to French'}
        data-gtm="lang_switch"
        data-lang={locale}
      >
        {labels[locale]}
      </button>
    </div>
  )
}

export default function Header() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'
  const t = STR[locale]
  const L = (path: string) => localizePath(path, locale)

  const searchAction = L('/products')
  const categories = useMemo(() => getCategories(locale), [locale])

  const cartStore = useCart() as CartStoreLike
  const wishlistStore = useWishlist() as WishlistStoreLike

  const cartCount = useMemo(() => getCartCount(cartStore?.cart), [cartStore?.cart])
  const wishlistCount = useMemo(
    () => getWishlistCount(wishlistStore?.wishlist),
    [wishlistStore?.wishlist]
  )

  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [placeholder, setPlaceholder] = useState<string>(() => t.trends[0] ?? '')

  const lastY = useRef(0)
  const ticking = useRef(false)
  const reducedMotion = useRef(false)
  const prefetchTimers = useRef<Map<string, number>>(new Map())
  const searchRef = useRef<HTMLInputElement | null>(null)
  const catBtnRef = useRef<HTMLButtonElement | null>(null)
  const catPanelRef = useRef<HTMLDivElement | null>(null)
  const catTimerRef = useRef<number | null>(null)

  const catBtnId = useId()
  const catPanelId = useId()

  const clearCatTimer = () => {
    if (catTimerRef.current) {
      window.clearTimeout(catTimerRef.current)
      catTimerRef.current = null
    }
  }

  const openCats = () => {
    clearCatTimer()
    setCatOpen(true)
  }

  const closeCats = (delay = 80) => {
    clearCatTimer()
    catTimerRef.current = window.setTimeout(() => setCatOpen(false), delay)
  }

  const isActive = (href: string) => {
    const localized = L(href)
    return localized === pathname || pathname.startsWith(`${localized}/`)
  }

  const prefetchPath = (href: string) => {
    const target = L(href)
    if (!target || isActive(href)) return

    try {
      router.prefetch(target)
    } catch {
      // no-op
    }
  }

  const smartPrefetchStart = (href: string) => {
    const target = L(href)
    if (!target || isActive(href)) return
    if (prefetchTimers.current.has(target)) return

    const timer = window.setTimeout(() => {
      prefetchPath(href)
      prefetchTimers.current.delete(target)
    }, HOVER_PREFETCH_DELAY)

    prefetchTimers.current.set(target, timer)
  }

  const smartPrefetchCancel = (href: string) => {
    const target = L(href)
    const timer = prefetchTimers.current.get(target)

    if (timer) {
      window.clearTimeout(timer)
      prefetchTimers.current.delete(target)
    }
  }

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
        setScrolled(y > 4)

        if (!reducedMotion.current) {
          setHidden(y > lastY.current && y > SCROLL_HIDE_OFFSET)
        } else {
          setHidden(false)
        }

        lastY.current = y
        ticking.current = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const trends: string[] = [...t.trends]
    setPlaceholder(trends[0] ?? '')

    const interval = window.setInterval(() => {
      setPlaceholder((current) => {
        const currentIndex = trends.indexOf(current)
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % trends.length : 0
        return trends[nextIndex] ?? ''
      })
    }, PLACEHOLDER_MS)

    return () => window.clearInterval(interval)
  }, [t.trends])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const editable =
        tag === 'INPUT' || tag === 'TEXTAREA' || Boolean(target?.isContentEditable)

      const isCmdK = e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)
      const isSlash = e.key === '/'

      if (!editable && (isCmdK || isSlash)) {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }

      if (e.key === 'Escape' && catOpen) {
        e.preventDefault()
        setCatOpen(false)
        catBtnRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [catOpen])

  useEffect(() => {
    const onPointerDown = (e: globalThis.MouseEvent) => {
      if (!catOpen) return

      const target = e.target as Node
      if (catPanelRef.current?.contains(target) || catBtnRef.current?.contains(target)) return

      setCatOpen(false)
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [catOpen])

  useEffect(() => {
    return () => {
      clearCatTimer()
      prefetchTimers.current.forEach((timer) => window.clearTimeout(timer))
      prefetchTimers.current.clear()
    }
  }, [])

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const data = new FormData(form)
    const q = String(data.get('q') || '').trim()

    if (!q) {
      e.preventDefault()
      searchRef.current?.focus()
    }
  }

  const onLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) return

    e.preventDefault()
    const url = L('/')

    try {
      router.push(url)
    } catch {
      window.location.assign(url)
    }
  }

  return (
    <header
      role="banner"
      aria-label={t.headerAria}
      data-hidden={hidden ? 'true' : 'false'}
      data-scrolled={scrolled ? 'true' : 'false'}
      className={cn(
        'fixed left-0 right-0 top-0 z-[80] w-full border-b border-transparent backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl',
        'bg-[hsl(var(--surface))]/80 transition-[background-color,border-color,box-shadow,transform] motion-safe:duration-300 motion-safe:ease-[var(--ease-smooth)]',
        'data-[scrolled=true]:bg-[hsl(var(--surface))]/92 data-[scrolled=true]:border-[hsl(var(--border))]/70 data-[scrolled=true]:shadow-[0_14px_40px_rgba(15,23,42,0.24)] dark:data-[scrolled=true]:shadow-[0_18px_60px_rgba(0,0,0,0.75)]',
        hidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="container-app flex h-16 items-center justify-between gap-4 md:h-[4.5rem] md:gap-3 lg:h-[4.75rem]">
        <NextLink
          href={L('/')}
          prefetch={false}
          aria-label={t.logoAria}
          rel="home"
          onClick={onLogoClick}
          className="touch-target group inline-flex items-center justify-center rounded-xl p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] md:min-h-0 md:min-w-0 md:p-1.5"
          data-gtm="header_logo_home"
        >
          <Logo
            className="h-7 w-auto md:h-9 lg:h-10"
            withText={false}
            srcLight="/logo.svg"
            srcDark="/logo-dark.svg"
            ariaLabel="TechPlay"
          />
        </NextLink>

        <form
          action={searchAction}
          method="get"
          role="search"
          aria-label={t.searchAria}
          onSubmit={onSearchSubmit}
          className="relative hidden min-w-0 flex-1 items-center md:flex lg:max-w-sm xl:max-w-md"
        >
          <label htmlFor="header-search" className="sr-only">
            {t.searchAria}
          </label>

          <div className="relative w-full">
            <span
              className="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-token-text/50"
              aria-hidden
            >
              <Search className="h-4 w-4" />
            </span>
            <input
              ref={searchRef}
              id="header-search"
              type="search"
              name="q"
              placeholder={`${t.placeholderPrefix} ${placeholder}`}
              list="header-search-suggestions"
              className={cn(
                'w-full rounded-xl border-2 py-2.5 pl-10 pr-11 text-sm',
                'border-[hsl(var(--border))] bg-[hsl(var(--surface))] placeholder:text-token-text/50',
                'focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.25)] focus:ring-offset-0'
              )}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="search"
              aria-keyshortcuts="/ Control+K Meta+K"
              aria-describedby="header-search-hint"
            />
            <div className="absolute inset-y-0 right-1 flex items-center">
              <button
                type="submit"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-sm hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                aria-label={t.searchAria}
                title={t.searchAria}
                data-gtm="header_search_submit"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <datalist id="header-search-suggestions">
            {t.trends.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <div id="header-search-hint" className="sr-only">
            {t.searchHint}
          </div>
        </form>

        <nav
          className="hidden items-center whitespace-nowrap text-[15px] font-medium tracking-tight text-token-text lg:flex lg:gap-5 xl:gap-7 xl:text-base"
          aria-label={t.headerNavAria}
        >
          {LINKS.map(({ href, labelKey }) => {
            const label = t.nav[labelKey]
            const active = isActive(href)

            if (labelKey === 'categories') {
              return (
                <div
                  key="mega-categories"
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
                    onClick={() => setCatOpen((value) => !value)}
                    onFocus={openCats}
                    onBlur={() => closeCats(100)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      'group relative rounded-full px-1.5 py-1 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
                      active
                        ? 'font-semibold text-[hsl(var(--accent))] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[hsl(var(--accent))]'
                        : 'hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]'
                    )}
                    data-gtm="header_mega_btn"
                  >
                    {label}

                    {!active ? (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full"
                      />
                    ) : null}
                  </button>

                  <div
                    ref={catPanelRef}
                    id={catPanelId}
                    role="menu"
                    aria-labelledby={catBtnId}
                    aria-hidden={catOpen ? 'false' : 'true'}
                    tabIndex={catOpen ? 0 : -1}
                    onFocus={openCats}
                    onBlur={() => closeCats(100)}
                    className={cn(
                      'absolute left-1/2 top-[calc(100%+12px)] z-50 w-[min(880px,94vw)] -translate-x-1/2 rounded-3xl border',
                      'border-[hsl(var(--border))] bg-[hsl(var(--surface))]/92 shadow-[0_26px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl',
                      'transition-all duration-200',
                      catOpen
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-1 opacity-0'
                    )}
                  >
                    <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-3 md:p-4">
                      <ul
                        role="none"
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:col-span-2 md:gap-3"
                      >
                        {categories.map((category) => (
                          <li key={category.href} role="none">
                            <Link
                              role="menuitem"
                              href={category.href}
                              prefetch={false}
                              onPointerEnter={() => smartPrefetchStart(category.href)}
                              onPointerLeave={() => smartPrefetchCancel(category.href)}
                              onFocus={() => smartPrefetchStart(category.href)}
                              onBlur={() => smartPrefetchCancel(category.href)}
                              className={cn(
                                'group flex items-center gap-3 rounded-xl border p-3 transition',
                                'border-transparent bg-[hsl(var(--surface))]/80 shadow-sm',
                                'hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.30)] hover:bg-[hsl(var(--surface))] hover:shadow-md'
                              )}
                              data-gtm="header_mega_cat"
                            >
                              <category.Icon className="opacity-80" />
                              <span className="flex-1">
                                <span className="block text-sm font-semibold">{category.label}</span>
                                <span className="block text-xs text-token-text/60">
                                  {category.desc}
                                </span>
                              </span>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                className="opacity-50 group-hover:opacity-90"
                                aria-hidden="true"
                              >
                                <path fill="currentColor" d="M9 18l6-6-6-6v12z" />
                              </svg>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="md:col-span-1">
                        <div className="h-full rounded-2xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.12)] via-[hsl(var(--surface))] to-[hsl(var(--surface-2))] p-4 shadow-md md:p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--accent))]/90">
                            {t.selection}
                          </p>

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
                              className="inline-flex items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1.5 text-[13px] font-semibold hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.30)]"
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
                  'group relative rounded-full px-1.5 py-1 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
                  active
                    ? 'font-semibold text-[hsl(var(--accent))] after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[hsl(var(--accent))]'
                    : 'hover:text-[hsl(var(--accent))] focus-visible:text-[hsl(var(--accent))]'
                )}
                data-gtm={`header_nav_${labelKey}`}
              >
                {label}

                {!active ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full"
                  />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="flex min-h-[2.75rem] items-center gap-3 md:hidden" style={{ touchAction: 'manipulation' }}>
          <Link
            href={L('/commande')}
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/commande')}
            onPointerLeave={() => smartPrefetchCancel('/commande')}
            className="touch-target relative flex items-center justify-center rounded-xl p-2.5 hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 md:p-1.5"
            aria-label={t.cartAria(cartCount)}
            data-gtm="header_cart_mobile"
            data-cart-icon
          >
            <Cart />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex min-w-[1.15rem] items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1 py-0.5 text-[10px] font-bold tabular-nums text-white">
                <span className="sr-only">Cart count: </span>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null}
          </Link>
          <MobileNav />
        </div>

        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle size="sm" />
            <LocaleSwitch pathname={pathname} />

            <div className="relative">
              <Link
                href="/wishlist"
                prefetch={false}
                onPointerEnter={() => smartPrefetchStart('/wishlist')}
                onPointerLeave={() => smartPrefetchCancel('/wishlist')}
                onFocus={() => smartPrefetchStart('/wishlist')}
                onBlur={() => smartPrefetchCancel('/wishlist')}
                className="relative rounded-lg p-0.5 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                aria-label={t.wishlistAria(wishlistCount)}
                data-gtm="header_wishlist"
              >
                <ActionBadge>
                  <Heart />
                </ActionBadge>
              </Link>

              {wishlistCount > 0 ? (
                <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
                  <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                    <span className="sr-only">Wishlist count: </span>
                    {wishlistCount}
                  </span>
                </div>
              ) : null}
            </div>

            <Link
              href="/login"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/login')}
              onPointerLeave={() => smartPrefetchCancel('/login')}
              onFocus={() => smartPrefetchStart('/login')}
              onBlur={() => smartPrefetchCancel('/login')}
              className="hidden items-center justify-center rounded-lg p-0.5 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] xl:inline-flex"
              aria-label={t.account.aria}
              title={t.account.title}
              data-gtm="header_account"
            >
              <ActionBadge>
                <User />
              </ActionBadge>
            </Link>
          </div>

          <div
            className="ml-3 flex items-center border-l border-[hsl(var(--border))] pl-3"
            aria-hidden="true"
          >
            <Link
              href="/commande"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/commande')}
              onPointerLeave={() => smartPrefetchCancel('/commande')}
              onFocus={() => smartPrefetchStart('/commande')}
              onBlur={() => smartPrefetchCancel('/commande')}
              className={cn(
                'relative inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border-2 px-4 py-2 transition-colors',
                'border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.14)] hover:border-[hsl(var(--accent)/.5)] hover:bg-[hsl(var(--accent)/.2)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]'
              )}
              aria-label={t.cartAria(cartCount)}
              data-gtm="header_cart"
              data-cart-icon
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]">
                <Cart />
              </span>
              <span className="hidden font-semibold text-[hsl(var(--text))] xl:inline">
                {t.cartShort}
              </span>
              {cartCount > 0 ? (
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="flex min-w-[1.4rem] items-center justify-center rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-[13px] font-bold tabular-nums text-white"
                >
                  <span className="sr-only">Cart count: </span>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <MobileNav />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-[hsl(var(--accent)/.40)] to-transparent"
      />
    </header>
  )
}