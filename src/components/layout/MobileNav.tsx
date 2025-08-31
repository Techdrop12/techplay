// src/components/layout/MobileNav.tsx — i18n-safe, icônes premium, catégories centralisées — FINAL++
'use client'

import Link from '@/components/LocalizedLink'
import { useEffect, useMemo, useRef, useState, useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { event as gaEvent, logEvent } from '@/lib/ga'
import { getCategories } from '@/lib/categories'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

/* ----------------------------- i18n strings ------------------------------ */
const STR = {
  fr: {
    nav: [
      { href: '/products', label: 'Produits' },
      { href: '/categorie', label: 'Catégories' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
      { href: '/products?promo=1', label: 'Offres', promo: true },
    ],
    ui: {
      openMenu: 'Ouvrir le menu mobile',
      closeMenu: 'Fermer le menu mobile',
      menu: 'Menu',
      searchAria: 'Recherche produits',
      searchBtn: 'Lancer la recherche',
      placeholderPrefix: 'Rechercher… ex:',
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
      srCountCart: 'Articles dans le panier : ',
      srCountWish: 'Articles dans la wishlist : ',
    },
    trends: ['écouteurs bluetooth', 'casque gaming', 'chargeur rapide USB-C', 'pack starter', 'power bank', 'souris sans fil'],
  },
  en: {
    nav: [
      { href: '/products', label: 'Products' },
      { href: '/categorie', label: 'Categories' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
      { href: '/products?promo=1', label: 'Deals', promo: true },
    ],
    ui: {
      openMenu: 'Open mobile menu',
      closeMenu: 'Close mobile menu',
      menu: 'Menu',
      searchAria: 'Product search',
      searchBtn: 'Start search',
      placeholderPrefix: 'Search… e.g.',
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
      srCountCart: 'Items in cart: ',
      srCountWish: 'Items in wishlist: ',
    },
    trends: ['bluetooth earbuds', 'gaming headset', 'USB-C fast charger', 'starter pack', 'power bank', 'wireless mouse'],
  },
} as const

/* ----------------------------- Icônes SVG pro ----------------------------- */
const Icon = {
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5ZM10 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 21s-7-4.6-9.3-8.3C1.3 9.9 3 6 6.9 6c2.2 0 3.4 1.2 4.1 2 0.7-0.8 1.9-2 4.1-2C19 6 20.7 9.9 21.3 12.7 19 16.4 12 21 12 21z"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z"/>
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6 5h14l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.3 3H2V1h4a2 2 0 0 1 2 1.7L8.3 5Z"/>
    </svg>
  ),
  Chevron: ({open=false}:{open?:boolean}) => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
      <path fill="currentColor" d="M12 15.5 4.5 8 6 6.5l6 6 6-6L19.5 8 12 15.5z"/>
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2s5 4 5 9a5 5 0 1 1-10 0c0-2 1-4 3-6-1 3 2 4 2 6 0 1.7-1 3-2.5 3.5A4.5 4.5 0 0 0 16.5 9C16.5 5.5 12 2 12 2Z"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 3v9l3.5-3.5 1.4 1.4L12 15.8 7.1 9.9l1.4-1.4L12 12V3h0ZM5 19h14v2H5v-2Z"/>
    </svg>
  ),
}

/* Utils */
const safeParseArray = <T,>(raw: string | null): T[] => {
  if (!raw) return []
  try { const v = JSON.parse(raw); return Array.isArray(v) ? (v as T[]) : [] } catch { return [] }
}
const norm = (s: string) => s.trim().replace(/\s+/g, ' ')
const same = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase()

/* Tracking tolérant */
const track = (args: { action: string; category?: string; label?: string; value?: number; [k: string]: any }) => {
  const { action, category, label, value, ...rest } = args
  const payload = { action, category: category ?? 'navigation', label: label ?? action, value: value ?? 1, ...rest }
  try { gaEvent?.(payload) } catch {}
  try { (logEvent as any)?.(action, payload) } catch {}
}

export default function MobileNav() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const locale = getCurrentLocale(pathname) as 'fr' | 'en'
  const t = STR[locale]
  const L = (p: string) => localizePath(p, locale)
  const SEARCH_ACTION = L('/products')

  // catégories localisées
  const categories = useMemo(() => getCategories(locale), [locale])

  const reducedMotion = useReducedMotion()
  const dialogId = useId()
  const titleId = `${dialogId}-title`

  // Stores (hooks inconditionnels)
  const cartStore = (() => { try { return useCart() as any } catch { return {} } })()
  const wishlistStore = (() => { try { return useWishlist() as any } catch { return {} } })()
  const cart = cartStore?.cart
  const wishlist = wishlistStore?.wishlist

  const cartCount = useMemo(() => {
    try {
      return Array.isArray(cart)
        ? cart.reduce((tt: number, i: any) => tt + (i?.quantity || 1), 0)
        : Array.isArray(cart?.items)
        ? cart.items.reduce((tt: number, i: any) => tt + (i?.quantity || 1), 0)
        : Number(cart?.count ?? cart?.size ?? 0) || 0
    } catch { return 0 }
  }, [cart])

  const wishlistCount = useMemo(() => {
    try {
      return Array.isArray(wishlist)
        ? wishlist.length
        : Array.isArray(wishlist?.items)
        ? wishlist.items.length
        : Number(wishlist?.count ?? wishlist?.size ?? 0) || 0
    } catch { return 0 }
  }, [wishlist])

  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  // Recherche
  const searchRef = useRef<HTMLInputElement | null>(null)
  const trends: string[] = useMemo(() => [...(t.trends as readonly string[])], [t])
  const [placeholder, setPlaceholder] = useState<string>(() => trends[0] ?? '')
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentQs, setRecentQs] = useState<string[]>([])
  const [catsOpen, setCatsOpen] = useState(false)

  // PWA
  const deferredPrompt = useRef<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  useEffect(() => {
    const onBeforeInstall = (e: any) => { e.preventDefault(); deferredPrompt.current = e; setCanInstall(true) }
    const onInstalled = () => setCanInstall(false)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  const handleInstall = async () => {
    try {
      track({ action: 'pwa_install_click', label: 'mobile_nav' })
      const dp = deferredPrompt.current
      if (!dp) return
      dp.prompt()
      await dp.userChoice
      deferredPrompt.current = null
      setCanInstall(false)
    } catch {}
  }

  // Scroll lock + inert
  const savedScrollY = useRef(0)
  const lockScroll = () => {
    savedScrollY.current = window.scrollY || document.documentElement.scrollTop
    const body = document.body
    const sbw = window.innerWidth - document.documentElement.clientWidth
    body.style.position = 'fixed'
    body.style.top = `-${savedScrollY.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'
    body.style.width = '100%'
    if (sbw > 0) body.style.paddingRight = `${sbw}px`
    const main = document.getElementById('main') as HTMLElement | null
    if (main) {
      mainRef.current = main
      try { ;(main as any).inert = true } catch {}
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
      try { ;(mainRef.current as any).inert = false } catch {}
      mainRef.current.removeAttribute('aria-hidden')
      mainRef.current = null
    }
  }

  const openMenu = () => { setOpen(true); try { navigator.vibrate?.(8) } catch {}; track({ action: 'mobile_nav_open', label: 'hamburger' }) }
  const closeMenu = (reason: string = 'close_btn') => { setOpen(false); track({ action: 'mobile_nav_close', label: reason }) }

  // Focus trap + ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu('escape')
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    if (open) {
      lockScroll()
      window.addEventListener('keydown', onKey)
      setTimeout(() => { searchRef.current?.focus() }, 0)
    } else {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
      triggerRef.current?.focus()
      setCatsOpen(false)
    }
    return () => { window.removeEventListener('keydown', onKey); unlockScroll() }
  }, [open])

  // Fermer à la nav
  useEffect(() => { if (open) closeMenu('route_change') }, [pathname])

  // Gestes
  const startY = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 70) { startY.current = null; closeMenu('swipe_down') }
  }
  const onTouchEnd = () => { startY.current = null }

  // Variants
  const overlayVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: reducedMotion ? 0 : 0.18 } }, exit: { opacity: 0, transition: { duration: 0.12 } } }
  const sheetVariants = { hidden: { y: reducedMotion ? 0 : '10%', opacity: 0.001 }, visible: { y: 0, opacity: 1, transition: { duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' } }, exit: { y: reducedMotion ? 0 : '10%', opacity: 0, transition: { duration: 0.16 } } }

  const isActive = (href: string) => {
    const tHref = L(href)
    return pathname === tHref || pathname.startsWith(tHref + '/')
  }

  const prefetchOnPointer = (href: string) => {
    try { const tHref = L(href); if (tHref && !isActive(href)) router.prefetch(tHref) } catch {}
  }

  // Placeholder (pause on focus + onglet masqué) + récentes
  useEffect(() => {
    let i = 0
    let id: number | null = null
    const start = () => {
      if (id || searchFocused || document.visibilityState !== 'visible') return
      id = window.setInterval(() => { i = (i + 1) % trends.length; setPlaceholder(trends[i] ?? '') }, 3500)
    }
    const stop = () => { if (id) { clearInterval(id); id = null } }
    const onVis = () => { if (document.visibilityState === 'visible' && !searchFocused) start(); else stop() }

    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); stop() }
  }, [searchFocused, trends])

  useEffect(() => {
    try {
      const arr = safeParseArray<string>(localStorage.getItem('recent:q'))
      if (arr.length) setRecentQs(arr.slice(0, 6))
    } catch {}
  }, [])

  const pushRecent = (q: string) => {
    const cleaned = norm(q)
    if (!cleaned) return
    try {
      const arr = safeParseArray<string>(localStorage.getItem('recent:q'))
      const next = [cleaned, ...arr.filter((x) => !same(x, cleaned))].slice(0, 6)
      localStorage.setItem('recent:q', JSON.stringify(next))
      setRecentQs(next)
    } catch {}
  }

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const data = new FormData(form)
    const q = norm(String(data.get('q') || ''))
    if (!q) { e.preventDefault(); searchRef.current?.focus(); return }
    try { localStorage.setItem('last:q', q) } catch {}
    pushRecent(q)
    track({ action: 'search_submit', label: q })
  }

  const goSearch = (q: string) => {
    const cleaned = norm(q)
    if (!cleaned) return
    pushRecent(cleaned)
    track({ action: 'search_chip_click', label: cleaned })
    closeMenu('search_chip')
    router.push(`${SEARCH_ACTION}?q=${encodeURIComponent(cleaned)}`)
  }

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={t.ui.openMenu}
        aria-keyshortcuts="Alt+M"
        type="button"
        className="md:hidden grid h-10 w-10 place-items-center rounded-xl hover:bg-token-surface-2 focus-ring"
      >
        <Icon.Menu />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center overscroll-contain"
            initial="hidden"
            animate="visible"
            exit="exit"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              variants={overlayVariants}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              ref={panelRef}
              className="supports-backdrop:glass supports-backdrop:bg-token-surface/80 relative w-full overflow-hidden border border-token-border bg-token-surface/90 shadow-2xl sm:max-w-md sm:rounded-2xl will-change-transform"
              variants={sheetVariants}
              drag={reducedMotion ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.04}
              onDragEnd={(_, info) => { if (info.offset.y > 80) setOpen(false) }}
            >
              <div className="pt-[env(safe-area-inset-top)]" />
              <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-token-text/20" aria-hidden="true" />
              <div className="flex items-center justify-between px-4 py-3">
                <h2 id={titleId} className="text-lg font-semibold">{t.ui.menu}</h2>
                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="rounded px-3 py-2 text-sm hover:bg-token-surface-2 focus-ring"
                  aria-label={t.ui.closeMenu}
                >
                  <Icon.Close />
                </button>
              </div>

              {/* Recherche */}
              <form
                action={SEARCH_ACTION}
                method="get"
                role="search"
                aria-label={t.ui.searchAria}
                onSubmit={onSearchSubmit}
                className="px-4 pb-2"
              >
                <div className="relative">
                  <input
                    ref={searchRef}
                    type="search"
                    name="q"
                    placeholder={`${t.ui.placeholderPrefix} ${placeholder}`}
                    list="mobile-search-suggestions"
                    className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-3 pr-12 text-base placeholder:text-token-text/50 focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.30)]"
                    autoComplete="off"
                    enterKeyHint="search"
                    inputMode="search"
                    aria-keyshortcuts="/ Control+K Meta+K"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  <datalist id="mobile-search-suggestions">
                    {trends.map((s) => <option value={s} key={s} />)}
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

              {/* Récentes */}
              {recentQs.length > 0 && (
                <div className="px-4 pb-3">
                  <div className="mb-2 text-xs font-semibold text-token-text/60">{t.ui.recent}</div>
                  <div className="flex flex-wrap gap-2">
                    {recentQs.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => goSearch(q)}
                        className="rounded-full border border-token-border bg-token-surface px-3 py-1.5 text-sm hover:bg-token-surface-2 focus-ring"
                        aria-label={`${t.ui.searchBtn}: ${q}`}
                      >
                        {q.length > 26 ? `${q.slice(0, 24)}…` : q}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { try { localStorage.removeItem('recent:q') } catch {}; setRecentQs([]) }}
                      className="ml-2 rounded-full bg-token-surface-2 px-3 py-1.5 text-xs text-token-text/70 hover:bg-token-surface focus-ring"
                      aria-label={t.ui.clear}
                    >
                      {t.ui.clear}
                    </button>
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex items-center gap-2 px-4 pb-3">
                <ThemeToggle size="md" />
                <Link
                  href="/wishlist"
                  prefetch={false}
                  onPointerDown={() => prefetchOnPointer('/wishlist')}
                  onFocus={() => prefetchOnPointer('/wishlist')}
                  onClick={() => { track({ action: 'mobile_nav_quick_wishlist' }); setOpen(false) }}
                  className="relative inline-flex items-center gap-2 rounded-lg border border-token-border px-3 py-2 text-sm font-medium hover:bg-token-surface-2 focus-ring"
                  aria-label={t.ui.wishlist(wishlistCount)}
                >
                  <Icon.Heart />
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      <span className="sr-only">{t.ui.srCountWish}</span>
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/login"
                  prefetch={false}
                  onPointerDown={() => prefetchOnPointer('/login')}
                  onFocus={() => prefetchOnPointer('/login')}
                  onClick={() => { track({ action: 'mobile_nav_quick_account' }); setOpen(false) }}
                  className="inline-flex items-center gap-2 rounded-lg border border-token-border px-3 py-2 text-sm font-medium hover:bg-token-surface-2 focus-ring"
                  aria-label={t.ui.account}
                >
                  <Icon.User />
                </Link>
                {/* PWA */}
                {canInstall && (
                  <button
                    onClick={handleInstall}
                    type="button"
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-lime-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    aria-label={t.ui.installAppTitle}
                    title={t.ui.installAppTitle}
                  >
                    <Icon.Download /> {t.ui.installApp}
                  </button>
                )}
              </div>

              {/* Catégories */}
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={() => setCatsOpen((v) => !v)}
                  aria-expanded={catsOpen}
                  className="flex w-full items-center justify-between rounded-xl border border-token-border bg-token-surface px-4 py-3 text-base font-semibold hover:bg-token-surface-2 focus-ring"
                >
                  {t.ui.categories}
                  <Icon.Chevron open={catsOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {catsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {categories.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              prefetch={false}
                              onPointerDown={() => prefetchOnPointer(c.href)}
                              onFocus={() => prefetchOnPointer(c.href)}
                              onClick={() => { track({ action: 'mobile_nav_cat', label: c.href }); setOpen(false) }}
                              className="group flex items-center gap-3 rounded-xl border border-transparent bg-token-surface/80 p-3 transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/.30)] hover:bg-token-surface shadow-sm hover:shadow-md focus-ring"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Liens */}
              <nav aria-label="Navigation mobile" className="px-5 pb-4">
                <ul className="grid grid-cols-1 gap-2 text-lg">
                  {t.nav.map((item) => {
                    const { href, label } = item
                    const promo = (item as any).promo === true || href.includes('promo=1')
                    const active = isActive(href)
                    const onClick = () => { track({ action: 'mobile_nav_link_click', label: href }); setOpen(false) }
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          prefetch={false}
                          onPointerDown={() => prefetchOnPointer(href)}
                          onFocus={() => prefetchOnPointer(href)}
                          onClick={onClick}
                          aria-current={active ? 'page' : undefined}
                          className={[
                            'block rounded-xl px-4 py-3 transition focus-ring',
                            promo
                              ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold shadow-md hover:shadow-lg text-center'
                              : active
                                ? 'bg-[hsl(var(--accent)/.10)] text-[hsl(var(--accent))] font-semibold border border-[hsl(var(--accent)/.30)]'
                                : 'hover:bg-token-surface-2 border border-transparent',
                          ].join(' ')}
                        >
                          {label}
                          {promo && <span className="ml-2 inline-flex align-middle"><Icon.Flame /></span>}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Footer: Panier */}
              <div className="border-token-border px-4 py-3 flex items-center gap-3 border-t">
                <Link
                  href="/commande"
                  prefetch={false}
                  onPointerDown={() => prefetchOnPointer('/commande')}
                  onFocus={() => prefetchOnPointer('/commande')}
                  onClick={() => { track({ action: 'mobile_nav_cart_click', label: 'cart', value: cartCount || 1 }); setOpen(false) }}
                  className="relative inline-flex items-center justify-center rounded-lg border border-token-border px-4 py-2 text-base font-semibold hover:bg-token-surface-2 focus-ring"
                  aria-label={t.ui.cart(cartCount)}
                >
                  <Icon.Cart />
                  {cartCount > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      <span className="sr-only">{t.ui.srCountCart}</span>
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  type="button"
                  className="ml-auto text-sm text-token-text/70 hover:underline focus:outline-none"
                  aria-label={t.ui.closeMenu}
                >
                  {t.ui.closeMenu}
                </button>
              </div>

              <div className="pb-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
