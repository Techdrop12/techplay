// src/components/layout/MobileNav.tsx — Ultra Premium Fusion (framer-motion + tokens + a11y)
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, useId } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { event as gaEvent, logEvent } from '@/lib/ga'

type NavItem = { href: string; label: string }

const NAV: Readonly<NavItem[]> = [
  { href: '/', label: 'Accueil' },
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/promo', label: '🎁 Offres' },
]

const SEARCH_TRENDS = [
  'écouteurs bluetooth',
  'casque gaming',
  'chargeur rapide USB-C',
  'pack starter',
  'power bank',
  'souris sans fil',
]

const track = (args: { action: string; category?: string; label?: string; value?: number; [k: string]: any }) => {
  try { gaEvent?.({ category: 'navigation', label: args.label ?? args.action, value: args.value ?? 1, ...args }) } catch {}
  try { logEvent?.(args.action, args) } catch {}
}

export default function MobileNav() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const dialogId = useId()
  const titleId = `${dialogId}-title`

  // 🛒 Panier (safe)
  let cartCount = 0
  try {
    const { cart } = useCart() as any
    cartCount = useMemo(
      () =>
        Array.isArray(cart)
          ? cart.reduce((t, i: any) => t + (i?.quantity || 1), 0)
          : Array.isArray(cart?.items)
          ? cart.items.reduce((t: number, i: any) => t + (i?.quantity || 1), 0)
          : Number(cart?.count ?? cart?.size ?? 0) || 0,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(cart)]
    )
  } catch { cartCount = 0 }

  // ❤ Wishlist (safe)
  let wishlistCount = 0
  try {
    const { wishlist } = useWishlist() as any
    wishlistCount = useMemo(
      () =>
        Array.isArray(wishlist)
          ? wishlist.length
          : Array.isArray(wishlist?.items)
          ? wishlist.items.length
          : Number(wishlist?.count ?? wishlist?.size ?? 0) || 0,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(wishlist)]
    )
  } catch { wishlistCount = 0 }

  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  // Recherche
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [placeholder, setPlaceholder] = useState(SEARCH_TRENDS[0])

  // PWA install
  const deferredPrompt = useRef<any>(null)
  const [canInstall, setCanInstall] = useState(false)
  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault()
      deferredPrompt.current = e
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
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

  // Scroll locking + inert
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

  const openMenu = () => {
    setOpen(true)
    try { navigator.vibrate?.(8) } catch {}
    track({ action: 'mobile_nav_open', label: 'hamburger' })
  }
  const closeMenu = (reason: string = 'close_btn') => {
    setOpen(false)
    track({ action: 'mobile_nav_close', label: reason })
  }

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
    }
    return () => { window.removeEventListener('keydown', onKey); unlockScroll() }
  }, [open])

  // Fermer à la navigation
  useEffect(() => { if (open) closeMenu('route_change') }, [pathname])

  // Gestes (swipe down)
  const startY = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 70) { startY.current = null; closeMenu('swipe_down') }
  }
  const onTouchEnd = () => { startY.current = null }

  // Variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reducedMotion ? 0 : 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  }
  const sheetVariants = {
    hidden: { y: reducedMotion ? 0 : '10%', opacity: 0.001 },
    visible: { y: 0, opacity: 1, transition: { duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' } },
    exit: { y: reducedMotion ? 0 : '10%', opacity: 0, transition: { duration: 0.16 } },
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const prefetchOnPointerDown = (href: string) => { try { if (href && !isActive(href)) router.prefetch(href) } catch {} }

  // Placeholder rotatif
  useEffect(() => {
    let i = 0
    const id = window.setInterval(() => { i = (i + 1) % SEARCH_TRENDS.length; setPlaceholder(SEARCH_TRENDS[i]) }, 3500)
    return () => clearInterval(id)
  }, [])

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const data = new FormData(form)
    const q = String(data.get('q') || '').trim()
    if (!q) { e.preventDefault(); searchRef.current?.focus(); return }
    try { localStorage.setItem('last:q', q) } catch {}
    track({ action: 'search_submit', label: q })
  }

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label="Ouvrir le menu mobile"
        className="md:hidden grid h-10 w-10 place-items-center rounded-xl hover:bg-token-surface-2 focus-ring"
      >
        ☰
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
            className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center"
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
              onClick={() => closeMenu('backdrop')}
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
              onDragEnd={(_, info) => { if (info.offset.y > 80) closeMenu('drag_close') }}
            >
              {/* Safe areas top */}
              <div className="pt-[env(safe-area-inset-top)]" />

              {/* Handle + Header */}
              <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-token-text/20" aria-hidden="true" />
              <div className="flex items-center justify-between px-4 py-3">
                <h2 id={titleId} className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => closeMenu('close_btn')}
                  className="rounded px-3 py-2 text-sm hover:bg-token-surface-2 focus-ring"
                  aria-label="Fermer le menu mobile"
                >
                  ✕
                </button>
              </div>

              {/* Barre recherche */}
              <form
                action="/products"
                method="get"
                role="search"
                aria-label="Recherche produits"
                onSubmit={onSearchSubmit}
                className="px-4 pb-2"
              >
                <div className="relative">
                  <input
                    ref={searchRef}
                    type="search"
                    name="q"
                    placeholder={`Rechercher… ex: ${placeholder}`}
                    list="mobile-search-suggestions"
                    className="w-full rounded-xl border border-token-border bg-token-surface px-4 py-3 pr-12 text-base placeholder:text-token-text/50 focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent)/.30)]"
                    autoComplete="off"
                    enterKeyHint="search"
                  />
                  <datalist id="mobile-search-suggestions">
                    {SEARCH_TRENDS.map((s) => <option value={s} key={s} />)}
                  </datalist>
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    aria-label="Lancer la recherche"
                    title="Rechercher"
                  >
                    🔎
                  </button>
                </div>
              </form>

              {/* Quick actions */}
              <div className="flex items-center gap-2 px-4 pb-3">
                <ThemeToggle size="md" />
                <Link
                  href="/wishlist"
                  prefetch={false}
                  onPointerDown={() => prefetchOnPointerDown('/wishlist')}
                  onClick={() => { track({ action: 'mobile_nav_quick_wishlist' }); closeMenu('quick_wishlist') }}
                  className="relative inline-flex items-center gap-2 rounded-lg border border-token-border px-3 py-2 text-sm font-medium hover:bg-token-surface-2 focus-ring"
                  aria-label="Voir la wishlist"
                >
                  🤍
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-fuchsia-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/login"
                  prefetch={false}
                  onPointerDown={() => prefetchOnPointerDown('/login')}
                  onClick={() => { track({ action: 'mobile_nav_quick_account' }); closeMenu('quick_account') }}
                  className="inline-flex items-center gap-2 rounded-lg border border-token-border px-3 py-2 text-sm font-medium hover:bg-token-surface-2 focus-ring"
                  aria-label="Espace client"
                >
                  👤
                </Link>
                {canInstall && (
                  <button
                    onClick={handleInstall}
                    className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-lime-500 to-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    aria-label="Installer l’application"
                    title="Installer l’application"
                  >
                    ⤓ Installer l’app
                  </button>
                )}
              </div>

              {/* Grid de liens */}
              <nav aria-label="Navigation mobile" className="px-5 pb-4">
                <ul className="grid grid-cols-1 gap-2 text-lg">
                  {NAV.map(({ href, label }) => {
                    const active = isActive(href)
                    const promo = href === '/promo'
                    const onClick = () => { track({ action: 'mobile_nav_link_click', label: href }); closeMenu('link_click') }
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          prefetch={false}
                          onPointerDown={() => prefetchOnPointerDown(href)}
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
                  onPointerDown={() => prefetchOnPointerDown('/commande')}
                  onClick={() => { track({ action: 'mobile_nav_cart_click', label: 'cart', value: cartCount || 1 }); closeMenu('cart') }}
                  className="relative inline-flex items-center justify-center rounded-lg border border-token-border px-4 py-2 text-base font-semibold hover:bg-token-surface-2 focus-ring"
                  aria-label="Voir le panier"
                >
                  🛒
                  {cartCount > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      <span className="sr-only">Articles dans le panier&nbsp;:</span>
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => closeMenu('close_btn')}
                  className="ml-auto text-sm text-token-text/70 hover:underline focus:outline-none"
                  aria-label="Fermer le menu mobile"
                >
                  Fermer
                </button>
              </div>

              {/* Safe areas bottom */}
              <div className="pb-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
