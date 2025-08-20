'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion'
import {cn} from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export interface Slide {
  id: number
  image: string
  alt: string
  text?: string
  ctaLabel?: string
  ctaLink?: string
}

interface HeroCarouselProps {
  slides?: Slide[]
  intervalMs?: number
  showOverlay?: boolean
  overlayOpacity?: number
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
  autoplay?: boolean
  className?: string
}

/* -------------------------------------------------------------------------- */
/*                                Config / UI                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    image: '/carousel1.jpg',
    alt: 'Casques Gaming',
    text: 'Casques Gaming — Immersion totale',
    ctaLabel: 'Découvrir',
    ctaLink: '/produit/casque-gaming',
  },
  {
    id: 2,
    image: '/carousel2.jpg',
    alt: 'Souris RGB',
    text: 'Souris RGB — Précision & Style',
    ctaLabel: 'Explorer',
    ctaLink: '/produit/souris-rgb',
  },
  {
    id: 3,
    image: '/carousel3.jpg',
    alt: 'Claviers Mécaniques',
    text: 'Claviers Mécaniques — Réactivité ultime',
    ctaLabel: 'Voir plus',
    ctaLink: '/produit/clavier-mecanique',
  },
]

const TEXT_SIZES = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-5xl sm:text-6xl',
  xl: 'text-6xl sm:text-7xl',
}

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function HeroCarousel({
  slides = DEFAULT_SLIDES,
  intervalMs = 7000,
  showOverlay = true,
  overlayOpacity = 0.35,
  textSize = 'xl',
  autoplay = true,
  className,
}: HeroCarouselProps) {
  const total = slides.length
  const [index, setIndex] = useState(0)
  const pausedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  /* ------------------------------ Derived slide ----------------------------- */
  const current = useMemo(() => slides[index], [slides, index])

  /* --------------------------------- Timer --------------------------------- */
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total)
  }, [total])

  const startTimer = useCallback(() => {
    if (pausedRef.current || !autoplay || prefersReducedMotion || total <= 1) return
    clearTimer()
    timerRef.current = setInterval(next, intervalMs)
  }, [autoplay, prefersReducedMotion, intervalMs, next, total])

  const pause = useCallback(() => {
    pausedRef.current = true
    clearTimer()
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    startTimer()
  }, [startTimer])

  useEffect(() => {
    startTimer()
    return clearTimer
  }, [startTimer])

  /* ------------------------- Pause si onglet non focus ---------------------- */
  useEffect(() => {
    const onVis = () => (document.hidden ? pause() : resume())
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pause, resume])

  /* --------------------------------- Swipe --------------------------------- */
  const onTouchStart: React.TouchEventHandler = (e) => {
    touchStartX.current = e.touches[0].clientX
    pause()
  }
  const onTouchEnd: React.TouchEventHandler = (e) => {
    if (touchStartX.current == null) return resume()
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) > 50) (delta > 0 ? prev : next)()
    resume()
  }

  /* ------------------------------ Keyboard nav ------------------------------ */
  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowRight') {
      pause()
      next()
      resume()
    } else if (e.key === 'ArrowLeft') {
      pause()
      prev()
      resume()
    } else if (e.key === 'Home') {
      pause()
      setIndex(0)
      resume()
    } else if (e.key === 'End') {
      pause()
      setIndex(total - 1)
      resume()
    }
  }

  if (total === 0) return null

  return (
    <section
      className={cn(
        // responsive heights + subtle rounded on desktop
        'relative h-[60vh] sm:h-[72vh] lg:h-[88vh] w-full overflow-hidden rounded-none sm:rounded-3xl shadow-2xl select-none',
        'bg-black/10 dark:bg-zinc-900',
        className
      )}
      aria-label="Carrousel principal TechPlay"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Slide layer */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={current.image}
            alt={current.alt}
            fill
            sizes="100vw"
            priority={index === 0}
            className="object-cover"
            placeholder="blur"
            // si tu n'as pas de blur dédié, ce chemin fonctionne comme blurDataURL
            blurDataURL="/placeholder-blur.png"
          />
        </motion.div>
      </AnimatePresence>

      {/* Vignette + overlay dégradé */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
      >
        {/* vignette douce */}
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,transparent,rgba(0,0,0,0.55))]" />
        {/* overlay paramétrable */}
        {showOverlay && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
          />
        )}
      </div>

      {/* Contenu texte + CTA */}
      {(current.text || (current.ctaLabel && current.ctaLink)) && (
        <div className="absolute inset-0 z-10 grid place-items-center px-6 sm:px-12 text-center">
          <div className="max-w-5xl mx-auto">
            {current.text && (
              <h2
                className={cn(
                  'font-extrabold tracking-tight drop-shadow-xl text-white',
                  'bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent',
                  TEXT_SIZES[textSize],
                )}
              >
                {current.text}
              </h2>
            )}

            {current.ctaLabel && current.ctaLink && (
              <div className="mt-6">
                <Link
                  href={current.ctaLink}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white',
                    'bg-accent shadow-lg transition-all duration-200',
                    'hover:scale-[1.03] hover:bg-accent/90 active:scale-95',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50'
                  )}
                >
                  {current.ctaLabel}
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
                    <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boutons Prev / Next */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Diapositive précédente"
            className={cn(
              'absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20',
              'rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur',
              'w-11 h-11 sm:w-12 sm:h-12 grid place-items-center',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
            )}
            onClick={() => { pause(); prev(); resume(); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.78 19.78L8 12l7.78-7.78l1.44 1.44L10.88 12l6.34 6.34z"/>
            </svg>
          </button>

          <button
            type="button"
            aria-label="Diapositive suivante"
            className={cn(
              'absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20',
              'rounded-full bg-black/35 hover:bg-black/50 text-white backdrop-blur',
              'w-11 h-11 sm:w-12 sm:h-12 grid place-items-center',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
            )}
            onClick={() => { pause(); next(); resume(); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M8.22 4.22L16 12l-7.78 7.78l-1.44-1.44L13.12 12L6.78 5.66z"/>
            </svg>
          </button>
        </>
      )}

      {/* Progress bar */}
      {autoplay && !prefersReducedMotion && total > 1 && (
        <div
          className="absolute bottom-6 left-1/2 w-[68%] max-w-3xl -translate-x-1/2 rounded-full bg-white/25 h-1.5 overflow-hidden z-20"
          role="presentation"
        >
          <motion.div
            key={index}
            className="bg-accent h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: intervalMs / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* Bullets */}
      {total > 1 && (
        <nav
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-3"
          aria-label="Navigation du carrousel"
        >
          {slides.map((_, i) => {
            const active = i === index
            return (
              <button
                key={i}
                type="button"
                className={cn(
                  'relative w-3.5 h-3.5 rounded-full transition',
                  active ? 'bg-white shadow ring-2 ring-accent/70 scale-110' : 'bg-white/60 hover:bg-white'
                )}
                aria-label={`Aller à la diapositive ${i + 1}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => { pause(); setIndex(i); resume(); }}
              />
            )
          })}
        </nav>
      )}

      {/* Zone tactile pour swipe (mobile) */}
      <div
        className="absolute inset-0 z-30"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-hidden="true"
      />
    </section>
  )
}
