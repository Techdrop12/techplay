'use client'

import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import Link from '@/components/LocalizedLink'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { getCategories } from '@/lib/categories'
import { event as gaEvent } from '@/lib/ga'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

const STR = {
  fr: {
    nav: [
      { href: '/products', label: 'Tous les produits' },
      { href: '/products/packs', label: 'Packs recommandés' },
      { href: '/categorie', label: 'Catégories' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Support & contact' },
    ],
    ui: {
      openMenu: 'Ouvrir le menu mobile',
      closeMenu: 'Fermer le menu mobile',
      menu: 'Menu',
      searchAria: 'Recherche produits',
      searchBtn: 'Lancer la recherche',
      placeholderPrefix: 'Rechercher… ex :',
      recent: 'Recherches récentes',
      clear: 'Effacer',
      categories: 'Catégories',
      wishlist: (n: number) => (n > 0 ? `Voir la wishlist (${n})` : 'Voir la wishlist'),
      account: 'Espace client',
      cart: (n: number) => (n > 0 ? `Voir le panier (${n})` : 'Voir le panier'),
      installApp: 'Installer l’app',
      installAppTitle: 'Installer l’application',
      dealsAria: 'Voir les offres du jour',
      dealsTitle: 'Offres du jour',
      mobileNavAria: 'Navigation mobile',
      shopLabel: 'Par où commencer',
      quickAccessLabel: 'Compte & accès',
    },
    trends: [
      'écouteurs bluetooth',
      'casque gaming',
      'chargeur rapide USB-C',
      'pack starter',
      'power bank',
      'souris sans fil',
    ],
  },
  en: {
    nav: [
      { href: '/products', label: 'All products' },
      { href: '/products/packs', label: 'Packs' },
      { href: '/categorie', label: 'Categories' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Support & contact' },
    ],
    ui: {
      openMenu: 'Open mobile menu',
      closeMenu: 'Close mobile menu',
      menu: 'Menu',
      searchAria: 'Product search',
      searchBtn: 'Start search',
      placeholderPrefix: 'Search… e.g.:',
      recent: 'Recent searches',
      clear: 'Clear',
      categories: 'Categories',
      wishlist: (n: number) => (n > 0 ? `View wishlist (${n})` : 'View wishlist'),
      account: 'Account',
      cart: (n: number) => (n > 0 ? `View cart (${n})` : 'View cart'),
      installApp: 'Install app',
      installAppTitle: 'Install the app',
      dealsAria: "See today's deals",
      dealsTitle: "Today's deals",
      mobileNavAria: 'Mobile navigation',
      shopLabel: 'Where to go',
      quickAccessLabel: 'Account & access',
    },
    trends: [
      'bluetooth earbuds',
      'gaming headset',
      'USB-C fast charger',
      'starter pack',
      'power bank',
      'wireless mouse',
    ],
  },
} as const

const Icon = {
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5ZM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 21s-7-4.6-9.3-8.3C1.3 9.9 3 6 6.9 6c2.2 0 3.4 1.2 4.1 2 0.7-0.8 1.9-2 4.1-2C19 6 20.7 9.9 21.3 12.7 19 16.4 12 21 12 21z" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 5h14l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.3 3H2V1h4a2 2 0 0 1 2 1.7L8.3 5Z" />
    </svg>
  ),
  Chevron: ({ open = false }: { open?: boolean }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path fill="currentColor" d="M12 15.5 4.5 8 6 6.5l6 6 6-6L19.5 8 12 15.5z" />
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2s5 4 5 9a5 5 0 1 1-10 0c0-2 1-4 3-6-1 3 2 4 2 6 0 1.7-1 3-2.5 3.5A4.5 4.5 0 0 0 16.5 9C16.5 5.5 12 2 12 2Z" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3v9l3.5-3.5 1.4 1.4L12 15.8 7.1 9.9l1.4-1.4L12 12V3Zm-7 16h14v2H5v-2Z" />
    </svg>
  ),
}

type CartItemLike = { quantity?: number }
type CartCollection =
  | CartItemLike[]
  | { items?: CartItemLike[]; count?: number; size?: number }
  | null
  | undefined
type WishlistCollection =
  | unknown[]
  | { items?: unknown[]; count?: number; size?: number }
  | null
  | undefined
type CartStoreLike = { cart?: CartCollection }
type WishlistStoreLike = { wishlist?: WishlistCollection }

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InertHTMLElement = HTMLElement & { inert?: boolean }

const PLACEHOLDER_MS = 4000

const safeParseArray = <T,>(raw: string | null): T[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

const norm = (value: string) => value.trim().replace(/\s+/g, ' ')
const same = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase()

function getQuantity(item: unknown): number {
  if (typeof item !== 'object' || item === null) return 1
  const quantity = Number((item as CartItemLike).quantity)
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

function track(args: {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: unknown
}) {
  const { action, category, label, value, ...rest } = args
  try {
    gaEvent?.({
      action,
      category: category ?? 'navigation',
      label: label ?? action,
      value: value ?? 1,
      ...rest,
    })
  } catch {
    // no-op
  }
}

export default function MobileNav() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'
  const t = STR[locale]
  const L = (path: string) => localizePath(path, locale)
  const searchAction = L('/products')

  const categories = useMemo(() => getCategories(locale), [locale])
  const reducedMotion = useReducedMotion()
  const dialogId = useId()
  const titleId = `${dialogId}-title`
  const catsPanelId = useId()

  const cartStore = useCart() as CartStoreLike
  const wishlistStore = useWishlist() as WishlistStoreLike

  const cart = cartStore?.cart
  const wishlist = wishlistStore?.wishlist

  const cartCount = useMemo(() => {
    if (Array.isArray(cart)) {
      return cart.reduce((total, item) => total + getQuantity(item), 0)
    }

    if (cart && typeof cart === 'object' && Array.isArray(cart.items)) {
      return cart.items.reduce((total, item) => total + getQuantity(item), 0)
    }

    const count = Number(cart?.count ?? cart?.size ?? 0)
    return Number.isFinite(count) ? count : 0
  }, [cart])

  const wishlistCount = useMemo(() => {
    if (Array.isArray(wishlist)) return wishlist.length
    if (wishlist && typeof wishlist === 'object' && Array.isArray(wishlist.items)) {
      return wishlist.items.length
    }

    const count = Number(wishlist?.count ?? wishlist?.size ?? 0)
    return Number.isFinite(count) ? count : 0
  }, [wishlist])

  const [open, setOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [placeholder, setPlaceholder] = useState<string>(() => t.trends[0] ?? '')
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentQs, setRecentQs] = useState<string[]>([])
  const [canInstall, setCanInstall] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<InertHTMLElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const savedScrollY = useRef(0)
  const startY = useRef<number | null>(null)

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reducedMotion ? 0 : 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  }

  const sheetVariants: Variants = {
    hidden: { y: reducedMotion ? 0 : '10%', opacity: 0.001 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' },
    },
    exit: { y: reducedMotion ? 0 : '10%', opacity: 0, transition: { duration: 0.16 } },
  }

  const isActive = (href: string) => {
    if (href === '/categorie') return false
    const localizedHref = L(href)
    return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)
  }

  const prefetchOnPointer = (href: string) => {
    try {
      const localizedHref = L(href)
      if (href !== '/categorie' && localizedHref && !isActive(href)) {
        router.prefetch(localizedHref)
      }
    } catch {
      // no-op
    }
  }

  const lockScroll = () => {
    savedScrollY.current = window.scrollY || document.documentElement.scrollTop

    const body = document.body
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.position = 'fixed'
    body.style.top = `-${savedScrollY.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'
    body.style.width = '100%'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    const main = document.getElementById('main') as InertHTMLElement | null
    if (main) {
      mainRef.current = main
      try {
        main.inert = true
      } catch {
        // no-op
      }
      main.setAttribute('aria-hidden', 'true')
    }
  }

  const unlockScroll = () => {
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.overflow = ''
    body.style.width = ''
    body.style.paddingRight = ''

    window.scrollTo(0, savedScrollY.current)

    if (mainRef.current) {
      try {
        mainRef.current.inert = false
      } catch {
        // no-op
      }
      mainRef.current.removeAttribute('aria-hidden')
      mainRef.current = null
    }
  }

  const openedByPointerRef = useRef(false)

  const openMenu = (e?: React.PointerEvent | React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (e?.type === 'pointerdown') {
      openedByPointerRef.current = true
    }
    if (!e && openedByPointerRef.current) {
      openedByPointerRef.current = false
      return
    }
    setOpen(true)
    try {
      navigator.vibrate?.(8)
    } catch {
      // no-op
    }
    track({ action: 'mobile_nav_open', label: 'hamburger' })
  }

  const closeMenu = (reason = 'close_btn') => {
    setOpen(false)
    track({ action: 'mobile_nav_close', label: reason })
  }

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      const e = event as BeforeInstallPromptEvent
      e.preventDefault()
      deferredPrompt.current = e
      setCanInstall(true)
    }

    const onInstalled = () => setCanInstall(false)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    try {
      const arr = safeParseArray<string>(localStorage.getItem('recent:q'))
      if (arr.length) setRecentQs(arr.slice(0, 6))
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    const trends = [...t.trends]
    setPlaceholder(trends[0] ?? '')

    let index = 0
    let intervalId: number | null = null

    const start = () => {
      if (intervalId || searchFocused || document.visibilityState !== 'visible') return
      intervalId = window.setInterval(() => {
        index = (index + 1) % trends.length
        setPlaceholder(trends[index] ?? '')
      }, PLACEHOLDER_MS)
    }

    const stop = () => {
      if (intervalId) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !searchFocused) start()
      else stop()
    }

    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [searchFocused, t.trends])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'Escape') {
        e.preventDefault()
        closeMenu('escape')
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )

        if (!focusables.length) return

        const first = focusables[0]
        const last = focusables[focusables.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    if (open) {
      lockScroll()
      window.addEventListener('keydown', onKey)
      const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768
      if (!isNarrow) {
        window.setTimeout(() => {
          searchRef.current?.focus()
        }, 0)
      }
    } else {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
      triggerRef.current?.focus()
      setCatsOpen(false)
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      unlockScroll()
    }
  }, [open])

  useEffect(() => {
    if (open) closeMenu('route_change')
  }, [pathname])

  const handleInstall = async () => {
    try {
      track({ action: 'pwa_install_click', label: 'mobile_nav' })
      const promptEvent = deferredPrompt.current
      if (!promptEvent) return
      await promptEvent.prompt()
      await promptEvent.userChoice
      deferredPrompt.current = null
      setCanInstall(false)
    } catch {
      // no-op
    }
  }

  const pushRecent = (q: string) => {
    const cleaned = norm(q)
    if (!cleaned) return

    try {
      const arr = safeParseArray<string>(localStorage.getItem('recent:q'))
      const next = [cleaned, ...arr.filter((item) => !same(item, cleaned))].slice(0, 6)
      localStorage.setItem('recent:q', JSON.stringify(next))
      setRecentQs(next)
    } catch {
      // no-op
    }
  }

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const data = new FormData(form)
    const q = norm(String(data.get('q') || ''))

    if (!q) {
      e.preventDefault()
      searchRef.current?.focus()
      return
    }

    try {
      localStorage.setItem('last:q', q)
    } catch {
      // no-op
    }

    pushRecent(q)
    track({ action: 'search_submit', label: q })
  }

  const goSearch = (q: string) => {
    const cleaned = norm(q)
    if (!cleaned) return

    pushRecent(cleaned)
    track({ action: 'search_chip_click', label: cleaned })
    closeMenu('search_chip')
    router.push(`${searchAction}?q=${encodeURIComponent(cleaned)}`)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? null
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return
    const currentY = e.touches[0]?.clientY ?? startY.current
    const delta = currentY - startY.current
    if (delta > 70) {
      startY.current = null
      closeMenu('swipe_down')
    }
  }

  const onTouchEnd = () => {
    startY.current = null
  }

  const openCatsFromNav = () => {
    setCatsOpen(true)
    track({ action: 'mobile_nav_link_click', label: '/categorie' })

    requestAnimationFrame(() => {
      try {
        document.getElementById(catsPanelId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      } catch {
        // no-op
      }
    })
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => openMenu()}
        onPointerDown={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={t.ui.openMenu}
        aria-keyshortcuts="Alt+M"
        className="touch-manipulation grid shrink-0 min-h-[2.75rem] min-w-[2.75rem] place-items-center rounded-xl hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 md:hidden"
        style={{ touchAction: 'manipulation' }}
      >
        <Icon.Menu />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-nav"
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain sm:items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              variants={overlayVariants}
              onClick={() => closeMenu('backdrop')}
              aria-hidden="true"
            />

            <motion.div
              className="relative flex max-h-[88dvh] w-full flex-col overflow-x-hidden overflow-y-auto overscroll-contain border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 shadow-2xl sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl"
              variants={sheetVariants}
              drag={reducedMotion ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.04}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) closeMenu('drag_close')
              }}
            >
              <div className="shrink-0 pt-[env(safe-area-inset-top)]" />
              <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-token-text/15" aria-hidden="true" />

              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <h2 id={titleId} className="text-lg font-semibold leading-tight text-[hsl(var(--text))]">
                  {t.ui.menu}
                </h2>

                <button
                  onClick={() => closeMenu('close_btn')}
                  type="button"
                  className="flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center rounded-xl hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 active:bg-[hsl(var(--surface-2))]/80"
                  aria-label={t.ui.closeMenu}
                >
                  <Icon.Close />
                </button>
              </div>

              <form
                action={searchAction}
                method="get"
                role="search"
                aria-label={t.ui.searchAria}
                onSubmit={onSearchSubmit}
                className="px-5 pb-4"
              >
                <div className="relative">
                  <input
                    ref={searchRef}
                    type="search"
                    name="q"
                    placeholder={`${t.ui.placeholderPrefix} ${placeholder}`}
                    list="mobile-search-suggestions"
                    className="min-h-[3rem] w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 pr-12 text-base placeholder:text-token-text/50 focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.30)]"
                    autoComplete="off"
                    enterKeyHint="search"
                    inputMode="search"
                    aria-keyshortcuts="/ Control+K Meta+K"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />

                  <datalist id="mobile-search-suggestions">
                    {t.trends.map((item) => (
                      <option value={item} key={item} />
                    ))}
                  </datalist>

                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    aria-label={t.ui.searchBtn}
                    title={t.ui.searchBtn}
                  >
                    <Icon.Search />
                  </button>
                </div>
              </form>

              {recentQs.length > 0 ? (
                <div className="px-5 pb-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-token-text/55">{t.ui.recent}</div>

                  <div className="flex flex-wrap gap-2">
                    {recentQs.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => goSearch(q)}
                        className="focus-ring min-h-[2.75rem] rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] hover:bg-[hsl(var(--surface))]/80"
                        aria-label={`${t.ui.searchBtn}: ${q}`}
                      >
                        {q.length > 26 ? `${q.slice(0, 24)}…` : q}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.removeItem('recent:q')
                        } catch {
                          // no-op
                        }
                        setRecentQs([])
                      }}
                      className="focus-ring min-h-[2.75rem] rounded-full bg-[hsl(var(--surface))]/80 px-4 py-2 text-[12px] text-token-text/70 hover:bg-[hsl(var(--surface))]"
                      aria-label={t.ui.clear}
                    >
                      {t.ui.clear}
                    </button>
                  </div>
                </div>
              ) : null}

              <section className="border-t border-[hsl(var(--border))]/60 px-5 py-4" aria-label={t.ui.quickAccessLabel}>
                <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-token-text/55">
                  {t.ui.quickAccessLabel}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <ThemeToggle size="md" />

                  <Link
                    href="/wishlist"
                    prefetch={false}
                    onPointerDown={() => prefetchOnPointer('/wishlist')}
                    onFocus={() => prefetchOnPointer('/wishlist')}
                    onClick={() => {
                      track({ action: 'mobile_nav_quick_wishlist' })
                      closeMenu('quick_wishlist')
                    }}
                    className="focus-ring inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-[13px] font-medium hover:bg-[hsl(var(--surface))]/80"
                    aria-label={t.ui.wishlist(wishlistCount)}
                  >
                    <Icon.Heart />
                    {wishlistCount > 0 ? (
                      <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    ) : null}
                  </Link>

                  <Link
                    href="/login"
                    prefetch={false}
                    onPointerDown={() => prefetchOnPointer('/login')}
                    onFocus={() => prefetchOnPointer('/login')}
                    onClick={() => {
                      track({ action: 'mobile_nav_quick_account' })
                      closeMenu('quick_account')
                    }}
                    className="focus-ring inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-[13px] font-medium hover:bg-[hsl(var(--surface))]/80"
                    aria-label={t.ui.account}
                  >
                    <Icon.User />
                  </Link>

                  {canInstall ? (
                    <button
                      onClick={handleInstall}
                      type="button"
                      className="ml-auto inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                      aria-label={t.ui.installAppTitle}
                      title={t.ui.installAppTitle}
                    >
                      <Icon.Download /> {t.ui.installApp}
                    </button>
                  ) : null}
                </div>
              </section>

              <div className="px-5 pb-4">
                <button
                  type="button"
                  onClick={() => setCatsOpen((value) => !value)}
                  aria-expanded={catsOpen}
                  aria-controls={catsPanelId}
                  className="focus-ring flex min-h-[2.75rem] w-full items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-base font-semibold hover:bg-[hsl(var(--surface))]/80"
                >
                  {t.ui.categories}
                  <Icon.Chevron open={catsOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {catsOpen ? (
                    <motion.div
                      id={catsPanelId}
                      role="region"
                      aria-label={t.ui.categories}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {categories.map((category) => (
                          <li key={category.href}>
                            <Link
                              href={category.href}
                              prefetch={false}
                              onPointerDown={() => prefetchOnPointer(category.href)}
                              onFocus={() => prefetchOnPointer(category.href)}
                              onClick={() => {
                                track({ action: 'mobile_nav_cat', label: category.href })
                                closeMenu('cat_click')
                              }}
                              className="focus-ring group flex min-h-[3rem] items-center gap-3 rounded-xl border border-transparent bg-[hsl(var(--surface))]/80 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.30)] hover:bg-[hsl(var(--surface))] hover:shadow-md"
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
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <section className="border-t border-[hsl(var(--border))]/60 px-5 pt-6 pb-5" aria-label={t.ui.mobileNavAria}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-token-text/55">
                  {t.ui.shopLabel}
                </p>
                <ul className="grid grid-cols-1 gap-2 text-lg">
                  {t.nav.map((item) => {
                    const { href, label } = item
                    const promo = ('promo' in item && item.promo === true) || href.includes('promo=1')

                    if (href === '/categorie') {
                      return (
                        <li key={href}>
                          <button
                            type="button"
                            onClick={openCatsFromNav}
                            aria-expanded={catsOpen}
                            aria-controls={catsPanelId}
                            className="focus-ring flex min-h-[3rem] w-full items-center rounded-xl border border-transparent px-4 py-3.5 text-left transition hover:bg-[hsl(var(--surface))]/80 active:bg-[hsl(var(--surface))]/60"
                          >
                            {label}
                          </button>
                        </li>
                      )
                    }

                    const active = isActive(href)

                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          prefetch={false}
                          onPointerDown={() => prefetchOnPointer(href)}
                          onFocus={() => prefetchOnPointer(href)}
                          onClick={() => {
                            track({ action: 'mobile_nav_link_click', label: href })
                            closeMenu('nav_link')
                          }}
                          aria-current={active ? 'page' : undefined}
                          className={[
                            'focus-ring flex min-h-[3rem] items-center rounded-xl px-4 py-3.5 transition active:bg-[hsl(var(--surface))]/60',
                            promo
                              ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-center font-semibold text-white shadow-md hover:shadow-lg'
                              : active
                                ? 'border border-[hsl(var(--accent)/.30)] bg-[hsl(var(--accent)/.10)] font-semibold text-[hsl(var(--accent))]'
                                : 'border border-transparent hover:bg-[hsl(var(--surface))]/80',
                          ].join(' ')}
                        >
                          {label}
                          {promo ? (
                            <span className="ml-2 inline-flex align-middle">
                              <Icon.Flame />
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>

              <div className="flex items-center gap-3 border-t border-[hsl(var(--border))] px-5 py-4">
                <Link
                  href="/commande"
                  prefetch={false}
                  onPointerDown={() => prefetchOnPointer('/commande')}
                  onFocus={() => prefetchOnPointer('/commande')}
                  onClick={() => {
                    track({ action: 'mobile_nav_cart_click', label: 'cart', value: cartCount || 1 })
                    closeMenu('cart_btn')
                  }}
                  className="focus-ring flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.12)] px-4 py-3 text-base font-semibold hover:bg-[hsl(var(--accent)/.2)] focus-visible:ring-[hsl(var(--accent)/.5)]"
                  aria-label={t.ui.cart(cartCount)}
                >
                  <Icon.Cart />
                  {cartCount > 0 ? (
                    <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-[13px] font-bold tabular-nums text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>

                <button
                  onClick={() => closeMenu('footer_close')}
                  type="button"
                  className="min-h-[3rem] min-w-[3rem] shrink-0 rounded-xl px-4 text-sm font-medium text-token-text/70 hover:bg-[hsl(var(--surface-2))] hover:text-token-text/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 active:bg-[hsl(var(--surface-2))]/80"
                  aria-label={t.ui.closeMenu}
                >
                  {t.ui.closeMenu}
                </button>
              </div>

              <div className="pb-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}