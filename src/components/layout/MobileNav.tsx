'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { motion, AnimatePresence } from 'framer-motion'
import { event as gaEvent, logEvent } from '@/lib/ga'

type NavItem = { href: string; label: string }

const NAV: NavItem[] = [
  { href: '/', label: 'Accueil' },
  { href: '/produit', label: 'Produits' },
  { href: '/pack', label: 'Packs' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/promo', label: '🎁 Promo du jour' },
]

// ——— Helper analytics: impose value (GAEvent le requiert)
const track = (args: { action: string; category: string; label: string; value?: number }) => {
  try {
    gaEvent?.({ ...args, value: args.value ?? 1 })
  } catch {
    // noop
  }
}

export default function MobileNav() {
  const pathname = usePathname()
  const { cart } = useCart()
  const cartCount = useMemo(
    () => (Array.isArray(cart) ? cart.reduce((t, i) => t + (i?.quantity || 1), 0) : 0),
    [cart]
  )

  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const startY = useRef<number | null>(null)
  const savedScrollY = useRef<number>(0)
  const reducedMotion = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reducedMotion.current = !!mq?.matches
    const onChange = () => { reducedMotion.current = !!mq?.matches }
    mq?.addEventListener?.('change', onChange)
    return () => mq?.removeEventListener?.('change', onChange)
  }, [])

  const lockScroll = () => {
    savedScrollY.current = window.scrollY || document.documentElement.scrollTop
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${savedScrollY.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.overflow = 'hidden'
    body.style.width = '100%'
  }
  const unlockScroll = () => {
    const body = document.body
    body.style.position = ''
    body.style.top = ''
    body.style.left = ''
    body.style.right = ''
    body.style.overflow = ''
    body.style.width = ''
    window.scrollTo({ top: savedScrollY.current, behavior: 'instant' as any })
  }

  const openMenu = () => {
    setOpen(true)
    track({ action: 'mobile_nav_open', category: 'engagement', label: 'hamburger' })
    logEvent?.('mobile_nav_open', { from: pathname })
  }
  const closeMenu = (reason: string = 'close_btn') => {
    setOpen(false)
    track({ action: 'mobile_nav_close', category: 'engagement', label: reason })
    logEvent?.('mobile_nav_close', { reason, from: pathname })
  }

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
      setTimeout(() => {
        const firstLink = dialogRef.current?.querySelector<HTMLElement>('a,button')
        firstLink?.focus()
      }, 0)
    } else {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
      triggerRef.current?.focus()
    }

    return () => {
      window.removeEventListener('keydown', onKey)
      unlockScroll()
    }
  }, [open])

  useEffect(() => {
    if (open) closeMenu('route_change')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return
    const delta = e.touches[0].clientY - startY.current
    if (delta > 60) {
      startY.current = null
      closeMenu('swipe_down')
    }
  }
  const onTouchEnd = () => {
    startY.current = null
  }

  const variants = {
    hidden: { opacity: 0, y: reducedMotion.current ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion.current ? 0 : 0.2 } },
    exit: { opacity: 0, y: reducedMotion.current ? 0 : 16, transition: { duration: 0.15 } },
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-nav-dialog"
        aria-label="Ouvrir le menu mobile"
        className="md:hidden p-2 text-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        ☰
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            id="mobile-nav-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            className="fixed inset-0 z-[9999] flex flex-col bg-white text-gray-900 dark:bg-black dark:text-white"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="pt-[env(safe-area-inset-top)]" />
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-gray-300 dark:bg-zinc-700" aria-hidden="true" />

            <div className="flex items-center justify-between px-4 py-3">
              <h2 id="mobile-nav-title" className="text-lg font-semibold">
                Menu
              </h2>
              <button
                onClick={() => closeMenu('close_btn')}
                className="rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Fermer le menu mobile"
              >
                ✕
              </button>
            </div>

            <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto px-6 pb-6">
              <ul className="space-y-3 text-xl text-gray-800 dark:text-gray-100">
                {NAV.map(({ href, label }) => {
                  const isPromo = href === '/promo'
                  const onClick = () => {
                    track({ action: 'mobile_nav_link_click', category: 'navigation', label: href })
                    logEvent?.('mobile_nav_link_click', { href })
                    closeMenu('link_click')
                  }
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        prefetch={false}
                        onClick={onClick}
                        className={
                          isPromo
                            ? 'inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-6 py-2 font-semibold text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                            : 'block rounded px-2 py-2 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                        }
                      >
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
              <Link
                href="/commande"
                prefetch={false}
                onClick={() => {
                  track({ action: 'mobile_nav_cart_click', category: 'navigation', label: 'cart', value: cartCount || 1 })
                  logEvent?.('mobile_nav_cart_click')
                  closeMenu('cart')
                }}
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
        )}
      </AnimatePresence>
    </>
  )
}
