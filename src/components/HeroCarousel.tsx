// src/components/HeroCarousel.tsx — Ultra Premium (fix swipe overlay + tokens + a11y)
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

/* -------------------------------- Types ---------------------------------- */

export interface Slide {
  id: number | string
  image?: string              // Image principale (fallback si pas de videoUrl)
  alt?: string                // Accessibilité / SEO
  text?: string               // Headline (optionnel)
  ctaLabel?: string
  ctaLink?: string
  videoUrl?: string           // (Optionnel) Vidéo muette
  poster?: string             // Poster vidéo
  badge?: string              // Badge optionnel (“-30% AUJOURD’HUI”)
}

interface HeroCarouselProps {
  slides?: Slide[]
  intervalMs?: number
  showOverlay?: boolean
  overlayOpacity?: number
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
  autoplay?: boolean
  className?: string
  showThumbnails?: boolean    // Miniatures (desktop)
  parallaxPx?: number         // Effet de parallaxe vertical (px max) — 0 = off
  edgeFade?: boolean          // Masques latéraux (fade)
  showPlayPause?: boolean
  onSlideChange?: (index: number, slide: Slide) => void
}

/* -------------------------------- Config --------------------------------- */

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

// Blur tiny placeholder
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJiIiB4PSIwIiB5PSIwIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYikiIGZpbGw9IiNlZWUiIC8+PC9zdmc+'

/* ------------------------------- Component ------------------------------- */

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
  const containerRef = useRef<HTMLDivElement | null>(null)

  const effectiveAutoplay = autoplay && !prefersReducedMotion && total > 1

  /* Derived slide */
  const current = useMemo(() => slides[index], [slides, index])

  /* Parallaxe (désactivée si parallaxPx = 0) */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxPx])
  const parallaxStyle = parallaxPx > 0 ? { y } : undefined

  /* Timer */
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

  /* Pause si onglet non focus */
  useEffect(() => {
    const onVis = () => (document.hidden ? pause() : resume())
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pause, resume])

  /* Prefetch images voisines */
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

  /* Annonce SR “Diapo X sur Y” */
  useEffect(() => {
    onSlideChange?.(index, current)
    try {
      const el = document.getElementById(srId)
      if (el) el.textContent = `Diapositive ${index + 1} sur ${total}: ${current?.alt || ''}`
    } catch {}
  }, [index, current, total, onSlideChange, srId])

  /* Swipe tactile (handlers sur le container, pas sur un overlay bloquant) */
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0].clientX
    pause()
  }
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return resume()
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) > 50) (delta > 0 ? prev() : next())
    resume()
  }

  /* Keyboard nav */
  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowRight') { pause(); next(); resume() }
    else if (e.key === 'ArrowLeft') { pause(); prev(); resume() }
    else if (e.key === 'Home') { pause(); setIndex(0); resume() }
    else if (e.key === 'End') { pause(); setIndex(total - 1); resume() }
    else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') { e.preventDefault(); isPaused ? resume() : pause() }
  }

  if (total === 0) return null

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative h-[60vh] sm:h-[72vh] lg:h-[88vh] w-full overflow-hidden rounded-none sm:rounded-3xl shadow-2xl select-none',
        'bg-token-surface/60 will-change-transform', // surface translucide pour le fallback
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
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      {/* Live region SR */}
      <span id={srId} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />

      {/* Edge fade (bords en dégradé) */}
      {edgeFade && (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-black/40 to-transparent dark:from-black/60"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-black/40 to-transparent dark:from-black/60"
            aria-hidden
          />
        </>
      )}

      {/* Slide layer */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={String(current.id)}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.25, scale: 0.99 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          className="absolute inset-0 z-0 will-change-transform"
          style={parallaxStyle as any}
          aria-roledescription="slide"
          aria-label={`${index + 1} / ${total}${current?.alt ? ` — ${current.alt}` : ''}`}
        >
          {/* Ken Burns doux */}
          <motion.div
            key={`kb-${String(current.id)}`}
            initial={{ scale: 1.02 }}
            animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.07 }}
            transition={{ duration: intervalMs / 1000, ease: 'linear' }}
            className="absolute inset-0 will-change-transform"
          >
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
                onPlay={(e: SyntheticEvent<HTMLVideoElement>) => { if (isPaused) e.currentTarget.pause() }}
              >
                <source src={current.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={current.image || '/og-image.jpg'}
                alt={current.alt || ''}
                fill
                sizes="100vw"
                priority={index === 0}
                quality={85}
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                draggable={false}
                onError={(e) => { (e.currentTarget as any).style.display = 'none' }}
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Vignette + overlay */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="overlay-hero absolute inset-0" />
        {showOverlay && (
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
        )}
        {/* Halo conique alimenté par --ring-conic */}
        <div
          className="absolute inset-0 opacity-60 mix-blend-overlay dark:mix-blend-screen"
          style={{ background: 'var(--ring-conic)' }}
        />
      </div>

      {/* Badge header (optionnel) */}
      {current.badge && (
        <div className="absolute left-5 top-5 z-20">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow dark:bg-black/60 dark:text-white">
            {current.badge}
          </span>
        </div>
      )}

      {/* Contenu texte + CTA */}
      {(current.text || (current.ctaLabel && current.ctaLink)) && (
        <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center sm:px-12">
          <div className="mx-auto max-w-5xl">
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
                    'inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold text-white sm:px-8 sm:text-lg',
                    'bg-[hsl(var(--accent))] shadow-lg transition-all duration-200',
                    'hover:scale-[1.03] hover:bg-[hsl(var(--accent)/.92)] active:scale-95',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.50)]'
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
              'supports-backdrop:glass absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-token-surface/70 text-white shadow-soft hover:bg-token-surface focus-ring sm:left-4 sm:h-12 sm:w-12'
            )}
            onClick={() => { pause(); prev(); resume() }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.78 19.78L8 12l7.78-7.78l1.44 1.44L10.88 12l6.34 6.34z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Diapositive suivante"
            className={cn(
              'supports-backdrop:glass absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-token-surface/70 text-white shadow-soft hover:bg-token-surface focus-ring sm:right-4 sm:h-12 sm:w-12'
            )}
            onClick={() => { pause(); next(); resume() }}
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
            'supports-backdrop:glass absolute right-3 top-3 z-20 rounded-full px-3 py-2 text-xs font-semibold text-white',
            'bg-black/40 backdrop-blur hover:bg-black/55 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
          )}
        >
          {isPaused ? '▶︎ Lire' : '⏸ Pause'}
        </button>
      )}

      {/* Progress bar */}
      {effectiveAutoplay && (
        <div
          className="absolute bottom-6 left-1/2 z-20 h-1.5 w-[68%] max-w-3xl -translate-x-1/2 overflow-hidden rounded-full bg-white/25"
          role="presentation"
        >
          <motion.div
            key={index}
            className="h-full rounded-full bg-[hsl(var(--accent))]"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: intervalMs / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* Bullets (mobile) */}
      {total > 1 && (
        <nav
          className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 sm:hidden"
          aria-label="Navigation du carrousel"
        >
          <ul className="flex gap-3">
            {slides.map((s, i) => {
              const active = i === index
              return (
                <li key={s.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'h-3.5 w-3.5 rounded-full transition',
                      active ? 'scale-110 bg-white ring-2 ring-[hsl(var(--accent)/.70)] shadow'
                             : 'bg-white/60 hover:bg-white'
                    )}
                    aria-label={`Aller à la diapositive ${i + 1} : ${s.alt || ''}`}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => { pause(); setIndex(i); resume() }}
                  />
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {/* Miniatures (desktop) */}
      {showThumbnails && total > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 sm:block" aria-label="Miniatures du carrousel">
          <ul className="flex gap-3">
            {slides.map((s, i) => {
              const active = i === index
              const thumb = s.image || s.poster || '/og-image.jpg'
              return (
                <li key={s.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'relative h-10 w-16 overflow-hidden rounded-lg border shadow sm:h-12 sm:w-20',
                      active ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]'
                             : 'border-white/60 hover:border-white'
                    )}
                    aria-label={`Aller à la diapositive ${i + 1}`}
                    aria-current={active ? 'true' : undefined}
                    onClick={() => { pause(); setIndex(i); resume() }}
                  >
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      draggable={false}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
