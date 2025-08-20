// src/components/layout/MobileNav.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useId } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { event as gaEvent, logEvent } from '@/lib/ga'

type NavItem = { href: string; label: string }

const NAV: Readonly<NavItem[]> = [
  { href: '/', label: 'Accueil' },
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/products?promo=1', label: '🎁 Offres' },
]

// Analytics helper
const track = (args: { action: string; category?: string; label?: string; value?: number; [k: string]: any }) => {
  try { gaEvent?.({ category: 'navigation', label: args.label ?? args.action, value: args.value ?? 1, ...args }) } catch {}
  try { (logEvent as any)?.(args.action, args) } catch {}
}

export default function MobileNav() {
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const dialogId = useId()
  const titleId = `${dialogId}-title`
  const hintId = `${dialogId}-hint`

  // ✅ Règle des hooks respectée — on appelle toujours le hook
  let cartCount = 0
  try {
    const { cart } = useCart()
    cartCount = Array.isArray(cart) ? cart.reduce((t, i: any) => t + (Number(i?.quantity) || 1), 0) : 0
  } catch {
    cartCount = 0 // si provider non monté très tôt
  }

  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // ===== Scroll lock (iOS-safe) =====
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
  }

  // ===== Rendre le reste de la page inerte pendant l’ouverture =====
  const setMainInert = (flag: boolean) => {
    const main = document.getElementById('main')
    if (!main) return
    try { (main as any).inert = flag } catch {}
    if (flag) {
      main.setAttribute('aria-hidden', 'true')
      ;(main as HTMLElement).style.pointerEvents = 'none'
      ;(main as HTMLElement).style.userSelect = 'none'
    } else {
      main.removeAttribute('aria-hidden')
      ;(main as HTMLElement).style.pointerEvents = ''
      ;(main as HTMLElement).style.userSelect = ''
    }
  }

  const openMenu = () => {
    setOpen(true)
    track({ action: 'mobile_nav_open', label: 'hamburger' })
  }
  const closeMenu = (reason: string = 'close_btn') => {
    setOpen(false)
    track({ action: 'mobile_nav_close', label: reason })
  }

  // ===== Focus trap + ESC + popstate (bouton retour) =====
  const pushedHistory = useRef(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu('escape')
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    const onPop = () => { if (open) closeMenu('popstate') }
    const onResize = () => { if (open) lockScroll() } // recalc padding scrollbar

    if (open) {
      lockScroll()
      setMainInert(true)
      window.addEventListener('keydown', onKey)
      window.addEventListener('resize', onResize)
      // bouton retour
      try { window.history.pushState({ m: 'menu' }, '', window.location.href); pushedHistory.current = true } catch {}
      window.addEventListener('popstate', onPop)

      // Focus premier interactif
      setTimeout(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>('a,button,[tabindex]:not([tabindex="-1"])')
        first?.focus()
      }, 0)
    } else {
      unlockScroll()
      setMainInert(false)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('popstate', onPop)
      if (pushedHistory.current) {
        try { window.history.back() } catch {}
        pushedHistory.current = false
      }
      triggerRef.current?.focus()
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('popstate', onPop)
      unlockScroll()
      setMainInert(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Fermer à la navigation
  useEffect(() => {
    if (open) closeMenu('route_change')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Gestes (swipe down pour fermer)
  const startY = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 70) { startY.current = null; closeMenu('swipe_down') }
  }
  const onTouchEnd = () => { startY.current = null }

  // Animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reducedMotion ? 0 : 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  }
  const sheetVariants = {
    hidden: { y: reducedMotion ? 0 : '8%', opacity: 0.001 },
    visible: { y: 0, opacity: 1, transition: { duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' } },
    exit: { y: reducedMotion ? 0 : '8%', opacity: 0, transition: { duration: 0.16 } },
  }

  const isActive = (href: string) => (pathname ? pathname === href || pathname.startsWith(href + '/') : false)

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label="Ouvrir le menu mobile"
        className="md:hidden p-2 text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
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
            aria-describedby={hintId}
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
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
              className="relative w-full sm:max-w-md sm:rounded-2xl overflow-hidden bg-white/90 dark:bg-zinc-950/90 supports-[backdrop-filter]:backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl"
              variants={sheetVariants}
              drag={reducedMotion ? false : 'y'}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.04}
              onDragEnd={(_, info) => { if (info.offset.y > 80) closeMenu('drag_close') }}
            >
              {/* Top handle + header */}
              <div className="pt-[env(safe-area-inset-top)]" />
              <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-gray-300/80 dark:bg-zinc-700/80" aria-hidden="true" />
              <div className="flex items-center justify-between px-4 py-3">
                <h2 id={titleId} className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => closeMenu('close_btn')}
                  className="rounded px-3 py-2 text-sm hover:bg-gray-100/70 dark:hover:bg-zinc-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Fermer le menu mobile"
                >
                  ✕
                </button>
              </div>
              <p id={hintId} className="sr-only">
                Utilisez la touche Échap pour fermer. Glissez vers le bas pour fermer sur mobile.
              </p>

              {/* Liens */}
              <nav aria-label="Navigation mobile" className="px-5 pb-4">
                <ul className="grid grid-cols-1 gap-2 text-lg text-gray-800 dark:text-gray-100">
                  {NAV.map(({ href, label }) => {
                    const promo = href.includes('promo=1') || href === '/promo'
                    const active = isActive(href)
                    const handleClick = () => {
                      track({ action: 'mobile_nav_link_click', label: href })
                      closeMenu('link_click')
                    }
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          prefetch={false}
                          onClick={handleClick}
                          aria-current={active ? 'page' : undefined}
                          className={[
                            'block rounded-xl px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                            promo
                              ? 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-semibold shadow-md hover:shadow-lg text-center'
                              : active
                                ? 'bg-accent/10 text-accent font-semibold border border-accent/30'
                                : 'hover:bg-gray-100/70 dark:hover:bg-zinc-800/70 border border-transparent',
                          ].join(' ')}
                        >
                          {label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Footer: Panier + Fermer */}
              <div className="border-t border-gray-200/70 dark:border-zinc-800/70 px-4 py-3 flex items-center justify-between">
                <Link
                  href="/commande"
                  prefetch={false}
                  onClick={() => { track({ action: 'mobile_nav_cart_click', label: 'cart', value: cartCount || 1 }); closeMenu('cart') }}
                  className="relative inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 text-base font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                  className="text-sm text-gray-600 hover:underline focus:outline-none dark:text-gray-400"
                  aria-label="Fermer le menu mobile"
                >
                  Fermer
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
