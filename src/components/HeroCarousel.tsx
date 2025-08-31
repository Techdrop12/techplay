// src/components/HeroCarousel.tsx — ULTIME++++ (LCP, i18n CTA, a11y clean, perf polish)
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
import { usePathname } from 'next/navigation'
import Link from '@/components/LocalizedLink'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { cn } from '@/lib/utils'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import '@/styles/hero-carousel.css' // ← styles overlay/fx

/* ------------------------ Premium inline icons ------------------------ */
function IconPlay({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  )
}
function IconPause({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}

/* -------------------------------- Types ---------------------------------- */

export interface Slide {
  id: number | string
  image?: string
  imageMobile?: string
  imageDesktop?: string
  alt?: string
  text?: string
  ctaLabel?: string
  ctaLink?: string
  videoUrl?: string
  poster?: string
  badge?: string
}

interface HeroCarouselProps {
  slides?: ReadonlyArray<Slide>
  intervalMs?: number
  showOverlay?: boolean
  overlayOpacity?: number
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
  autoplay?: boolean
  className?: string
  showThumbnails?: boolean
  showBullets?: boolean
  showCounter?: boolean
  parallaxPx?: number
  edgeFade?: boolean
  showPlayPause?: boolean
  pauseOnHover?: boolean
  pauseWhenHidden?: boolean
  progressClickable?: boolean
  swipeThreshold?: number
  onSlideChange?: (index: number, slide: Slide) => void
}

/* -------------------------------- Config --------------------------------- */

const TEXT_SIZES = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-5xl sm:text-6xl',
  xl: 'text-6xl sm:text-7xl',
} as const

const BLUR_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

/* ------------------------------- Helpers --------------------------------- */

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    ;(window as any).dataLayer?.push({ event, ...payload })
  } catch {}
}

const SLIDES_I18N: Record<'fr' | 'en', ReadonlyArray<Slide>> = {
  fr: [
    {
      id: 1,
      imageMobile: '/carousel/hero-1-mobile.jpg',
      imageDesktop: '/carousel/hero-1-desktop.jpg',
      alt: 'Casques gaming — immersion totale',
      text: 'Casques Gaming — Immersion totale',
      ctaLabel: 'Découvrir',
      ctaLink: '/products?cat=casques',
      badge: 'Nouveautés',
    },
    {
      id: 2,
      imageMobile: '/carousel/hero-2-mobile.jpg',
      imageDesktop: '/carousel/hero-2-desktop.jpg',
      alt: 'Souris RGB — précision & style',
      text: 'Souris RGB — Précision & Style',
      ctaLabel: 'Explorer',
      ctaLink: '/products?cat=souris',
    },
    {
      id: 3,
      imageMobile: '/carousel/hero-3-mobile.jpg',
      imageDesktop: '/carousel/hero-3-desktop.jpg',
      alt: 'Claviers mécaniques — réactivité ultime',
      text: 'Claviers Mécaniques — Réactivité ultime',
      ctaLabel: 'Voir plus',
      ctaLink: '/products?cat=claviers',
    },
  ],
  en: [
    {
      id: 1,
      imageMobile: '/carousel/hero-1-mobile.jpg',
      imageDesktop: '/carousel/hero-1-desktop.jpg',
      alt: 'Gaming headsets — total immersion',
      text: 'Gaming Headsets — Total Immersion',
      ctaLabel: 'Discover',
      ctaLink: '/products?cat=casques',
      badge: 'New',
    },
    {
      id: 2,
      imageMobile: '/carousel/hero-2-mobile.jpg',
      imageDesktop: '/carousel/hero-2-desktop.jpg',
      alt: 'RGB mice — precision & style',
      text: 'RGB Mice — Precision & Style',
      ctaLabel: 'Explore',
      ctaLink: '/products?cat=souris',
    },
    {
      id: 3,
      imageMobile: '/carousel/hero-3-mobile.jpg',
      imageDesktop: '/carousel/hero-3-desktop.jpg',
      alt: 'Mechanical keyboards — ultimate reactivity',
      text: 'Mechanical Keyboards — Ultimate Reactivity',
      ctaLabel: 'See more',
      ctaLink: '/products?cat=claviers',
    },
  ],
}

/* ------------------------------- Component ------------------------------- */

export default function HeroCarousel({
  slides,
  intervalMs = 7000,
  showOverlay = true,
  overlayOpacity = 0.35,
  textSize = 'xl',
  autoplay = true,
  className,
  showThumbnails = true,
  showBullets = true,
  showCounter = true,
  parallaxPx = 40,
  edgeFade = true,
  showPlayPause = true,
  pauseOnHover = true,
  pauseWhenHidden = true,
  progressClickable = true,
  swipeThreshold = 50,
  onSlideChange,
}: HeroCarouselProps) {
  const pathname = usePathname() || '/'
  const locale = getCurrentLocale(pathname) as 'fr' | 'en'

  // Slides finaux (props > i18n)
  const slidesFinal = useMemo<ReadonlyArray<Slide>>(
    () => (slides && slides.length ? slides : SLIDES_I18N[locale]),
    [slides, locale]
  )

  const total = Math.max(0, slidesFinal.length)
  const [index, setIndex] = useState(0)

  // Pause states
  const [isPaused, setPaused] = useState(false)
  const userPausedRef = useRef(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const srId = useId()
  const instructionsId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  const effectiveAutoplay = autoplay && !prefersReducedMotion && total > 1

  const t = useMemo(() => {
    const en = locale === 'en'
    return en
      ? {
          mainLabel: 'TechPlay main carousel',
          prev: 'Previous slide',
          next: 'Next slide',
          pause: 'Pause carousel',
          play: 'Play carousel',
          nav: 'Carousel navigation',
          thumbs: 'Carousel thumbnails',
          goTo: 'Go to slide ',
          of: ' of ',
          instructions: 'Use left and right arrows to navigate, Space to pause or resume.',
          btnPlay: 'Play',
          btnPause: 'Pause',
        }
      : {
          mainLabel: 'Carrousel principal TechPlay',
          prev: 'Diapositive précédente',
          next: 'Diapositive suivante',
          pause: 'Mettre le carrousel en pause',
          play: 'Lancer le carrousel',
          nav: 'Navigation du carrousel',
          thumbs: 'Miniatures du carrousel',
          goTo: 'Aller à la diapositive ',
          of: ' sur ',
          instructions:
            'Utilisez les flèches gauche/droite pour naviguer, Espace pour mettre en pause ou relancer.',
          btnPlay: 'Lire',
          btnPause: 'Pause',
        }
  }, [locale])

  const current = useMemo(() => slidesFinal[index], [slidesFinal, index])

  useEffect(() => {
    if (index > Math.max(0, slidesFinal.length - 1)) setIndex(0)
  }, [slidesFinal.length, index])

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxPx])
  const parallaxStyle = !prefersReducedMotion && parallaxPx > 0 ? { y } : undefined

  const clearTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  const next = useCallback(() => { setIndex((i) => (total ? (i + 1) % total : 0)); pushDL('hero_next', { index: index + 1 }) }, [total, index])
  const prev = useCallback(() => { setIndex((i) => (total ? (i - 1 + total) % total : 0)); pushDL('hero_prev', { index: index - 1 }) }, [total, index])
  const startTimer = useCallback(() => {
    if (!effectiveAutoplay) return
    clearTimer()
    timerRef.current = setInterval(next, intervalMs)
  }, [effectiveAutoplay, intervalMs, next])

  // Pauses
  const pauseUser = useCallback(() => {
    userPausedRef.current = true
    setPaused(true)
    clearTimer()
    pushDL('hero_paused_user')
  }, [])
  const resumeUser = useCallback(() => {
    userPausedRef.current = false
    setPaused(false)
    startTimer()
    pushDL('hero_resumed_user')
  }, [startTimer])

  const autoPause = useCallback(() => {
    if (userPausedRef.current) return
    setPaused(true)
    clearTimer()
  }, [])
  const autoResume = useCallback(() => {
    if (userPausedRef.current) return
    setPaused(false)
    startTimer()
  }, [startTimer])

  // Lifecycle timer
  useEffect(() => { startTimer(); return clearTimer }, [startTimer])

  // Onglet masqué/visible
  useEffect(() => {
    const onVis = () => (document.hidden ? autoPause() : autoResume())
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [autoPause, autoResume])

  // Hors écran → auto pause/resume
  useEffect(() => {
    if (!pauseWhenHidden || typeof window === 'undefined') return
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      const v = entries[0]?.isIntersecting
      if (v) autoResume()
      else autoPause()
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [pauseWhenHidden, autoPause, autoResume])

  // Warm cache
  useEffect(() => {
    if (typeof window === 'undefined' || total <= 1) return
    const nextIdx = (index + 1) % total
    const prevIdx = (index - 1 + total) % total
    const urls = [
      slidesFinal[nextIdx]?.imageDesktop || slidesFinal[nextIdx]?.image || slidesFinal[nextIdx]?.poster,
      slidesFinal[prevIdx]?.imageDesktop || slidesFinal[prevIdx]?.image || slidesFinal[prevIdx]?.poster,
      slidesFinal[nextIdx]?.imageMobile,
      slidesFinal[prevIdx]?.imageMobile,
    ].filter(Boolean) as string[]
    urls.forEach((src) => { const img = new window.Image(); img.src = src })
  }, [index, slidesFinal, total])

  // ARIA live
  useEffect(() => {
    onSlideChange?.(index, current)
    try {
      const el = document.getElementById(srId)
      if (el) el.textContent =
        (locale === 'en' ? 'Slide ' : 'Diapositive ') +
        (index + 1) + t.of + total + ': ' + (current?.alt || '')
    } catch {}
  }, [index, current, total, onSlideChange, srId, t, locale])

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => { touchStartX.current = e.touches[0].clientX; if (pauseOnHover) autoPause() }
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) return autoResume()
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) > swipeThreshold) (delta > 0 ? prev() : next())
    autoResume()
  }

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowRight') { autoPause(); next(); autoResume() }
    else if (e.key === 'ArrowLeft') { autoPause(); prev(); autoResume() }
    else if (e.key === 'Home') { autoPause(); setIndex(total ? 0 : 0); autoResume() }
    else if (e.key === 'End') { autoPause(); setIndex(total ? total - 1 : 0); autoResume() }
    else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') { e.preventDefault(); userPausedRef.current ? resumeUser() : pauseUser() }
  }

  if (total === 0) return null

  // i18n: CTA localisé via i18n-routing
  const localizedHref = (href?: string) => localizePath(href || '/products', locale)

  const slideAria = index + 1 + ' / ' + total + (current?.alt ? ' — ' + current.alt : '')

  const desktopSrc = current?.imageDesktop || current?.image || current?.poster || '/og-image.jpg'
  const mobileSrc = current?.imageMobile || current?.imageDesktop || current?.image || current?.poster || '/og-image.jpg'

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative h-[60vh] sm:h-[72vh] lg:h-[88vh] w-full overflow-hidden rounded-none sm:rounded-3xl shadow-2xl select-none',
        'bg-token-surface/60 will-change-transform touch-pan-y',
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.mainLabel}
      aria-describedby={instructionsId}
      aria-live="off"
      onMouseEnter={pauseOnHover ? autoPause : undefined}
      onMouseLeave={pauseOnHover ? autoResume : undefined}
      onFocus={pauseOnHover ? autoPause : undefined}
      onBlur={pauseOnHover ? autoResume : undefined}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      <span id={srId} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
      <p id={instructionsId} className="sr-only">{t.instructions}</p>

      {edgeFade && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-black/40 to-transparent dark:from-black/60" aria-hidden />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-black/40 to-transparent dark:from-black/60" aria-hidden />
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={String(current?.id)}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.25, scale: 0.99 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          className="absolute inset-0 z-0 will-change-transform"
          style={parallaxStyle as any}
          aria-roledescription="slide"
          aria-label={slideAria}
        >
          <motion.div
            key={'kb-' + String(current?.id)}
            initial={{ scale: 1.02 }}
            animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.07 }}
            transition={{ duration: intervalMs / 1000, ease: 'linear' }}
            className="absolute inset-0 will-change-transform"
          >
            {current?.videoUrl ? (
              <video
                key={String(current.videoUrl)}
                className="h-full w-full object-cover"
                playsInline
                muted
                loop
                autoPlay={effectiveAutoplay}
                preload="metadata"
                poster={current.poster || desktopSrc}
                disablePictureInPicture
                controls={false}
                onPlay={(e: SyntheticEvent<HTMLVideoElement>) => { if (userPausedRef.current) e.currentTarget.pause() }}
              >
                <source src={current.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <>
                {/* a11y: images décoratives → alt="" (le slide a déjà aria-label) */}
                <Image
                  src={mobileSrc}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  quality={85}
                  className="object-cover sm:hidden"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  draggable={false}
                  onError={(e) => { ;(e.currentTarget as any).style.display = 'none' }}
                />
                <Image
                  src={desktopSrc}
                  alt=""
                  fill
                  sizes="100vw"
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  quality={88}
                  className="hidden object-cover sm:block"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  draggable={false}
                  onError={(e) => { ;(e.currentTarget as any).style.display = 'none' }}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="overlay-hero absolute inset-0" />
        {showOverlay && <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,' + overlayOpacity + ')' }} />}
        <div className="absolute inset-0 opacity-60 mix-blend-overlay dark:mix-blend-screen" style={{ background: 'var(--ring-conic)' }} />
      </div>

      {current?.badge && (
        <div className="absolute left-5 top-5 z-20">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow dark:bg-black/60 dark:text-white">
            {current.badge}
          </span>
        </div>
      )}

      {showCounter && total > 1 && (
        <div className="supports-backdrop:glass absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {index + 1 + ' / ' + total}
        </div>
      )}

      {(current?.text || current?.ctaLabel) && (
        <div className="absolute inset-0 z-10 grid place-items-center px-6 text-center sm:px-12">
          <div className="mx-auto max-w-5xl">
            {current?.text && (
              <h2
                className={cn(
                  'font-extrabold tracking-tight drop-shadow-xl text-white',
                  'bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent',
                  TEXT_SIZES[textSize]
                )}
              >
                {current.text}
              </h2>
            )}

            {current?.ctaLabel && (
              <div className="mt-6">
                <Link
                  href={localizedHref(current.ctaLink)}
                  prefetch={false}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold text-white sm:px-8 sm:text-lg',
                    'bg-[hsl(var(--accent))] shadow-lg transition-all duration-200',
                    'hover:scale-[1.03] hover:bg-[hsl(var(--accent)/.92)] active:scale-95',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.50)]'
                  )}
                  aria-label={(current?.ctaLabel || '') + (current?.alt ? ' — ' + current.alt : '')}
                  data-gtm="home_hero_cta"
                  data-slide-id={String(current.id)}
                  onClick={() => pushDL('hero_cta', { slideId: current.id })}
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

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label={t.prev}
            className={cn(
              'supports-backdrop:glass absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-token-surface/70 text-white shadow-soft hover:bg-token-surface',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:left-4 sm:h-12 sm:w-12'
            )}
            data-gtm="hero_prev"
            onClick={() => { autoPause(); prev(); autoResume() }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.78 19.78L8 12l7.78-7.78l1.44 1.44L10.88 12l6.34 6.34z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={t.next}
            className={cn(
              'supports-backdrop:glass absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-token-surface/70 text-white shadow-soft hover:bg-token-surface',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:right-4 sm:h-12 sm:w-12'
            )}
            data-gtm="hero_next"
            onClick={() => { autoPause(); next(); autoResume() }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M8.22 4.22L16 12l-7.78 7.78l-1.44-1.44L13.12 12L6.78 5.66z" />
            </svg>
          </button>
        </>
      )}

      {showPlayPause && total > 1 && (
        <button
          type="button"
          onClick={() => (userPausedRef.current ? resumeUser() : pauseUser())}
          aria-label={userPausedRef.current ? t.play : t.pause}
          aria-pressed={userPausedRef.current}
          className={cn(
            'supports-backdrop:glass absolute right-3 top-3 z-20 rounded-full px-3 py-2 text-xs font-semibold text-white',
            'bg-black/40 backdrop-blur hover:bg-black/55 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
          )}
          data-gtm="hero_toggle"
        >
          <span className="inline-flex items-center gap-1.5">
            {userPausedRef.current ? <IconPlay /> : <IconPause />}
            <span>{userPausedRef.current ? t.btnPlay : t.btnPause}</span>
          </span>
        </button>
      )}

      {effectiveAutoplay && (
        <div
          ref={progressRef}
          className="absolute bottom-6 left-1/2 z-20 h-1.5 w-[68%] max-w-3xl -translate-x-1/2 overflow-hidden rounded-full bg-white/25"
          role="presentation"
          aria-hidden="true"
          onClick={(e) => {
            if (!progressClickable || total <= 1) return
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            const target = Math.min(total - 1, Math.floor(ratio * total))
            autoPause(); setIndex(target); autoResume()
            pushDL('hero_seek', { target })
          }}
          style={progressClickable ? { cursor: 'pointer' } : undefined}
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

      {showBullets && total > 1 && (
        <nav className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 sm:hidden" aria-label={t.nav}>
          <ul className="flex gap-3">
            {slidesFinal.map((s, i) => {
              const active = i === index
              const bulletLabel = t.goTo + (i + 1) + (s.alt ? ' : ' + s.alt : '')
              return (
                <li key={s.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'h-3.5 w-3.5 rounded-full transition',
                      active ? 'scale-110 bg-white ring-2 ring-[hsl(var(--accent)/.70)] shadow'
                             : 'bg-white/60 hover:bg-white'
                    )}
                    aria-label={bulletLabel}
                    aria-current={active ? 'true' : undefined}
                    data-gtm="hero_bullet"
                    data-idx={i}
                    onClick={() => { autoPause(); setIndex(i); autoResume() }}
                  />
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {showThumbnails && total > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 sm:block" aria-label={t.thumbs}>
          <ul className="flex gap-3">
            {slidesFinal.map((s, i) => {
              const active = i === index
              const thumb = s.imageDesktop || s.image || s.poster || '/og-image.jpg'
              return (
                <li key={s.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'relative h-10 w-16 overflow-hidden rounded-lg border shadow sm:h-12 sm:w-20',
                      active ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]'
                             : 'border-white/60 hover:border-white'
                    )}
                    aria-label={(locale === 'en' ? 'Go to slide ' : 'Aller à la diapositive ') + (i + 1)}
                    aria-current={active ? 'true' : undefined}
                    data-gtm="hero_thumb"
                    data-idx={i}
                    onClick={() => { autoPause(); setIndex(i); autoResume() }}
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

      <noscript>
        <p className="mt-2 text-center">
          <a href="/products">Voir les produits</a>
        </p>
      </noscript>
    </section>
  )
}
