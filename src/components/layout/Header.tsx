'use client'

import NextLink from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'

import Logo from '../Logo'

import MobileNav from './MobileNav'

import Link from '@/components/LocalizedLink'
import {
  CartIcon as Cart,
  FlameIcon as Flame,
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
      products: 'Produits',
      wishlist: 'Wishlist',
      blog: 'Blog',
      contact: 'Contact',
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
    deals: {
      text: 'Offres',
      title: 'Offres du jour',
      aria: 'Voir les offres du jour',
    },
    selection: 'Sélection',
    packsTitle: 'Packs recommandés',
    packsDesc: 'Les meilleures combinaisons pour booster ton setup.',
    viewPacks: 'Voir les packs',
    allProducts: 'Tous les produits',
    wishlistAria: (n: number) => (n > 0 ? `Voir la wishlist (${n})` : 'Voir la wishlist'),
    cartAria: (n: number) => (n > 0 ? `Voir le panier (${n})` : 'Voir le panier'),
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
      products: 'Products',
      wishlist: 'Wishlist',
      blog: 'Blog',
      contact: 'Contact',
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
    deals: {
      text: 'Deals',
      title: "Today's deals",
      aria: "See today's deals",
    },
    selection: 'Featured',
    packsTitle: 'Recommended packs',
    packsDesc: 'Best combos to boost your setup.',
    viewPacks: 'View packs',
    allProducts: 'All products',
    wishlistAria: (n: number) => (n > 0 ? `View wishlist (${n})` : 'View wishlist'),
    cartAria: (n: number) => (n > 0 ? `View cart (${n})` : 'View cart'),
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
  { href: '/products', labelKey: 'products' },
  { href: '/wishlist', labelKey: 'wishlist' },
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

  return (
    <div
      role="group"
      aria-label={t.localeSwitcherAria}
      className="inline-flex items-center rounded-full border border-token-border bg-token-surface/60 p-0.5"
    >
      {(['fr', 'en'] as const).map((lang) => {
        const active = locale === lang

        return (
          <button
            key={lang}
            type="button"
            onClick={() => setLang(lang)}
            onMouseDown={(e) => e.preventDefault()}
            disabled={active}
            aria-pressed={active}
            className={cn(
              'rounded-full px-2.5 py-1.5 text-xs font-semibold transition outline-none focus:ring-2',
              active
                ? 'cursor-default bg-[hsl(var(--accent))] text-white focus:ring-[hsl(var(--accent)/.4)]'
                : 'bg-transparent text-token-text hover:opacity-90 focus:ring-[hsl(var(--accent)/.4)]'
            )}
            title={lang === 'fr' ? 'Français' : 'English'}
          >
            {lang.toUpperCase()}
          </button>
        )
      })}
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
        'fixed left-0 right-0 top-0 z-[80] w-full border-b backdrop-blur transition-all motion-safe:duration-300 motion-safe:ease-out',
        hidden ? '-translate-y-full' : 'translate-y-0',
        scrolled
          ? 'border-token-border bg-token-surface/85 shadow-soft'
          : 'border-transparent bg-token-surface/65'
      )}
    >
      <div className="container-app flex h-16 items-center justify-between gap-2 sm:gap-3 md:h-20">
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

        <form
          action={searchAction}
          method="get"
          role="search"
          aria-label={t.searchAria}
          onSubmit={onSearchSubmit}
          className="relative hidden min-w-0 flex-1 items-center md:flex lg:max-w-md xl:max-w-lg"
        >
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
            aria-describedby="header-search-hint"
          />

          <datalist id="header-search-suggestions">
            {t.trends.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <div id="header-search-hint" className="sr-only">
            {t.searchHint}
          </div>

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

        <nav
          className="hidden whitespace-nowrap text-[15px] font-medium tracking-tight text-token-text lg:flex lg:gap-5 xl:gap-7 xl:text-base"
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
                      'group relative rounded-sm px-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
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
                        className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full"
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
                      'absolute left-1/2 top-[calc(100%+10px)] z-50 w-[min(860px,92vw)] -translate-x-1/2 rounded-2xl border',
                      'border-token-border bg-token-surface/90 shadow-2xl backdrop-blur',
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
                                'border-transparent bg-token-surface/80 shadow-sm',
                                'hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.30)] hover:bg-token-surface hover:shadow-md'
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
                        <div className="h-full rounded-xl border border-token-border bg-gradient-to-br from-[hsl(var(--accent)/.10)] via-transparent to-token-surface p-4 shadow-md md:p-5">
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
                  'group relative rounded-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]',
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
                    className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-[hsl(var(--accent))] transition-all duration-300 group-hover:w-full"
                  />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <ThemeToggle size="sm" />
          <LocaleSwitch pathname={pathname} />

          <Link
            href="/products?promo=1"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/products?promo=1')}
            onPointerLeave={() => smartPrefetchCancel('/products?promo=1')}
            onFocus={() => smartPrefetchStart('/products?promo=1')}
            onBlur={() => smartPrefetchCancel('/products?promo=1')}
            className="inline-flex items-center justify-center rounded-lg p-0.5 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)] xl:hidden"
            aria-label={t.deals.aria}
            title={t.deals.title}
            data-gtm="header_deals_icon"
          >
            <ActionBadge>
              <Flame />
            </ActionBadge>
          </Link>

          <Link
            href="/products?promo=1"
            prefetch={false}
            onPointerEnter={() => smartPrefetchStart('/products?promo=1')}
            onPointerLeave={() => smartPrefetchCancel('/products?promo=1')}
            onFocus={() => smartPrefetchStart('/products?promo=1')}
            onBlur={() => smartPrefetchCancel('/products?promo=1')}
            className="group hidden items-center gap-2 rounded-full border border-token-border bg-token-surface/60 px-3 py-1.5 text-sm font-medium text-token-text hover:bg-token-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent)/.40)] xl:inline-flex"
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

          <div className="relative">
            <Link
              href="/commande"
              prefetch={false}
              onPointerEnter={() => smartPrefetchStart('/commande')}
              onPointerLeave={() => smartPrefetchCancel('/commande')}
              onFocus={() => smartPrefetchStart('/commande')}
              onBlur={() => smartPrefetchCancel('/commande')}
              className="relative rounded-lg p-0.5 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              aria-label={t.cartAria(cartCount)}
              data-gtm="header_cart"
              data-cart-icon
            >
              <ActionBadge>
                <Cart />
              </ActionBadge>
            </Link>

            {cartCount > 0 ? (
              <div aria-live="polite" aria-atomic="true" className="absolute -right-2 -top-2">
                <span className="animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-sm">
                  <span className="sr-only">Cart count: </span>
                  {cartCount}
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

        <MobileNav />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-[hsl(var(--accent)/.40)] to-transparent"
      />
    </header>
  )
}