// src/components/HeroCarousel.tsx
'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
  type SyntheticEvent,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export interface Slide {
  id: number | string
  /** Image principale (fallback si pas de videoUrl) */
  image?: string
  /** Pour accessibilité / SEO */
  alt?: string
  /** Texte headline (optionnel) */
  text?: string
  /** CTA (optionnel) */
  ctaLabel?: string
  ctaLink?: string
  /** (Optionnel) Vidéo muette: mp4/webm (autoplay si actif) */
  videoUrl?: string
  /** Poster vidéo (sinon image utilisée) */
  poster?: string
  /** Badge optionnel (ex: “-30% AUJOURD’HUI”) */
  badge?: string
}

interface HeroCarouselProps {
  slides?: Slide[]
  intervalMs?: number
  showOverlay?: boolean
  overlayOpacity?: number
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
  autoplay?: boolean
  className?: string
  /** Afficher les miniatures (desktop) */
  showThumbnails?: boolean
  /** Effet de parallaxe vertical (px max) — 0 pour désactiver */
  parallaxPx?: number
  /** Masques latéraux (fade) */
  edgeFade?: boolean
  /** Bouton Play/Pause */
  showPlayPause?: boolean
  /** Callback slide change */
  onSlideChange?: (index: number, slide: Slide) => void
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
    badge: 'Nouveautés',
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
} as const

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
  showThumbnails = true,
  parallaxPx = 40,
  edgeFade = true,
  showPlayPause = true,
  onSlideChange,
}: HeroCarouselProps) {
  const total = Math.max(0, slides.length)
  const [index, setIndex] = useState(0)
  const [isPaused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const srId = useId()
  const containerRef = useRef<HTMLElement | null>(null)

  const effectiveAutoplay = autoplay && !prefersReducedMotion && total > 1

  /* ------------------------------ Derived slide ----------------------------- */
  const current = useMemo(() => slides[index], [slides, index])

  /* -------------------------------- Parallaxe ------------------------------- */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxPx])
  const parallaxStyle = parallaxPx > 0 ? { y } : undefined

  /* --------------------------------- Timer --------------------------------- */
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const next = useCallback(() => {
    setIndex((i) => (total ? (i + 1) % total : 0))
  }, [total])

  const prev = useCallback(() => {
    setIndex((i) => (total ? (i - 1 + total) % total : 0))
  }, [total])

  const startTimer = useCallback(() => {
    if (pausedRef.current || !effectiveAutoplay) return
    clearTimer()
    timerRef.current = setInterval(next, intervalMs)
  }, [effectiveAutoplay, intervalMs, next])

  const pause = useCallback(() => {
    pausedRef.current = true
    setPaused(true)
    clearTimer()
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    setPaused(false)
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

  /* ----------------------- Prefetch des images voisines --------------------- */
  useEffect(() => {
    if (typeof window === 'undefined' || total <= 1) return
    const nextIdx = (index + 1) % total
    const prevIdx = (index - 1 + total) % total
    const urls = [
      slides[nextIdx]?.image || slides[nextIdx]?.poster,
      slides[prevIdx]?.image || slides[prevIdx]?.poster,
    ].filter(Boolean) as string[]
    urls.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [index, slides, total])

  /* --------------------- Annonce SR “Diapo X sur Y: alt” -------------------- */
  useEffect(() => {
    onSlideChange?.(index, current)
    try {
      const el = document.getElementById(srId)
      if (el) el.textContent = `Diapositive ${index + 1} sur ${total}: ${current?.alt || ''}`
    } catch {}
  }, [index, current, total, onSlideChange, srId])

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
    } else if (e.key.toLowerCase() === ' ') {
      e.preventDefault()
      isPaused ? resume() : pause()
    }
  }

  if (total === 0) return null

  return (
    <section
      ref={containerRef as any}
      className={cn(
        'relative h-[60vh] sm:h-[72vh] lg:h-[88vh] w-full overflow-hidden rounded-none sm:rounded-3xl shadow-2xl select-none',
        'bg-black/10 dark:bg-zinc-900',
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carrousel principal TechPlay"
      aria-live="off"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {/* Live region SR */}
      <span id={srId} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      {/* Edge fade (bords en dégradé) */}
      {edgeFade && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-36 z-[2] bg-gradient-to-r from-black/40 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-36 z-[2] bg-gradient-to-l from-black/40 to-transparent"
            aria-hidden
          />
        </>
      )}

      {/* Slide layer */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.25, scale: 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
          style={parallaxStyle as any}
        >
          {/* Image ou vidéo */}
          {current.videoUrl ? (
            <video
              key={String(current.videoUrl)}
              className="h-full w-full object-cover"
              playsInline
              muted
              loop
              autoPlay={effectiveAutoplay}
              preload="metadata"
              poster={current.poster || current.image}
              onPlay={(e: SyntheticEvent<HTMLVideoElement>) => {
                if (isPaused) e.currentTarget.pause()
              }}
            >
              <source src={current.videoUrl} />
            </video>
          ) : (
            <Image
              src={current.image || '/placeholder.png'}
              alt={current.alt || ''}
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
              placeholder="blur"
              blurDataURL="/placeholder-blur.png"
              draggable={false}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Vignette + overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,transparent,rgba(0,0,0,0.55))]" />
        {showOverlay && (
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
        )}
      </div>

      {/* Badge header (optionnel) */}
      {current.badge && (
        <div className="absolute top-5 left-5 z-20">
          <span className="rounded-full bg-white/90 dark:bg-black/60 text-black dark:text-white px-3 py-1 text-xs font-semibold shadow">
            {current.badge}
          </span>
        </div>
      )}

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
                  prefetch
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white',
                    'bg-accent shadow-lg transition-all duration-200',
                    'hover:scale-[1.03] hover:bg-accent/90 active:scale-95',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50'
                  )}
                  aria-label={`${current.ctaLabel} — ${current.alt || ''}`}
                >
                  {current.ctaLabel}
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="opacity-90">
                    <path fill="currentColor" d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
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
            onClick={() => {
              pause()
              prev()
              resume()
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.78 19.78L8 12l7.78-7.78l1.44 1.44L10.88 12l6.34 6.34z" />
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
            onClick={() => {
              pause()
              next()
              resume()
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M8.22 4.22L16 12l-7.78 7.78l-1.44-1.44L13.12 12L6.78 5.66z" />
            </svg>
          </button>
        </>
      )}

      {/* Play / Pause */}
      {showPlayPause && total > 1 && (
        <button
          type="button"
          onClick={() => (isPaused ? resume() : pause())}
          aria-label={isPaused ? 'Lancer le carrousel' : 'Mettre le carrousel en pause'}
          className={cn(
            'absolute top-3 right-3 z-20 rounded-full px-3 py-2 text-xs font-semibold',
            'bg-black/40 text-white backdrop-blur hover:bg-black/55',
            'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
          )}
        >
          {isPaused ? '▶︎ Lire' : '⏸ Pause'}
        </button>
      )}

      {/* Progress bar */}
      {effectiveAutoplay && (
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

      {/* Bullets (mobile) */}
      {total > 1 && (
        <nav
          className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-3"
          aria-label="Navigation du carrousel"
        >
          {slides.map((s, i) => {
            const active = i === index
            return (
              <button
                key={s.id ?? i}
                type="button"
                className={cn(
                  'relative w-3.5 h-3.5 rounded-full transition',
                  active
                    ? 'bg-white shadow ring-2 ring-accent/70 scale-110'
                    : 'bg-white/60 hover:bg-white'
                )}
                aria-label={`Aller à la diapositive ${i + 1} : ${s.alt || ''}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => {
                  pause()
                  setIndex(i)
                  resume()
                }}
              />
            )
          })}
        </nav>
      )}

      {/* Miniatures (desktop) */}
      {showThumbnails && total > 1 && (
        <div
          className="hidden sm:block absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          aria-label="Miniatures du carrousel"
        >
          <ul className="flex gap-3">
            {slides.map((s, i) => {
              const active = i === index
              const thumb = s.image || s.poster || '/placeholder.png'
              return (
                <li key={s.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'relative w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden border shadow',
                      active ? 'border-accent ring-2 ring-accent' : 'border-white/60 hover:border-white'
                    )}
                    aria-label={`Aller à la diapositive ${i + 1}`}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => {
                      pause()
                      setIndex(i)
                      resume()
                    }}
                  >
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                      draggable={false}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
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
