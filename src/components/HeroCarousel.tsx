'use client'

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from 'framer-motion'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type SyntheticEvent,
  type TouchEventHandler,
} from 'react'

import Link from '@/components/LocalizedLink'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'
import { cn } from '@/lib/utils'
import '@/styles/hero-carousel.css'

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

const DEFAULT_SLIDES: ReadonlyArray<Slide> = [
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
] as const

const TEXT_SIZES = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-5xl sm:text-6xl',
  xl: 'text-6xl sm:text-7xl',
} as const

const BLUR_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA='

function pushDL(event: string, payload?: Record<string, unknown>) {
  try {
    const dataLayer = (window as Window & {
      dataLayer?: Array<Record<string, unknown>>
    }).dataLayer

    dataLayer?.push({
      event,
      ...payload,
    })
  } catch {
    // no-op
  }
}

function getImageSrc(slide?: Slide): { desktop: string; mobile: string } {
  const desktop = slide?.imageDesktop || slide?.image || slide?.poster || '/og-image.jpg'
  const mobile =
    slide?.imageMobile || slide?.imageDesktop || slide?.image || slide?.poster || '/og-image.jpg'

  return { desktop, mobile }
}

export default function HeroCarousel({
  slides = DEFAULT_SLIDES,
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
  const locale = getCurrentLocale(pathname)

  const total = Math.max(0, slides.length)
  const canNavigate = total > 1
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  const userPausedRef = useRef(false)
  const touchStartX = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const srId = useId()
  const instructionsId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const effectiveAutoplay = autoplay && !prefersReducedMotion && canNavigate

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
          ctaFallback: 'Discover',
          noscriptProducts: 'View products',
          slideWord: 'Slide ',
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
          ctaFallback: 'Découvrir',
          noscriptProducts: 'Voir les produits',
          slideWord: 'Diapositive ',
        }
  }, [locale])

  const current = useMemo(() => slides[index], [slides, index])

  useEffect(() => {
    if (index > Math.max(0, slides.length - 1)) {
      setIndex(0)
    }
  }, [index, slides.length])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxPx])
  const parallaxStyle: MotionStyle | undefined =
    !prefersReducedMotion && parallaxPx > 0 ? { y } : undefined

  const next = useCallback(() => {
    setIndex((currentIndex) => {
      const nextIndex = canNavigate ? (currentIndex + 1) % total : 0
      pushDL('hero_next', { index: nextIndex })
      return nextIndex
    })
  }, [canNavigate, total])

  const prev = useCallback(() => {
    setIndex((currentIndex) => {
      const prevIndex = canNavigate ? (currentIndex - 1 + total) % total : 0
      pushDL('hero_prev', { index: prevIndex })
      return prevIndex
    })
  }, [canNavigate, total])

  const pauseUser = useCallback(() => {
    userPausedRef.current = true
    setIsPaused(true)
    pushDL('hero_paused_user')
  }, [])

  const resumeUser = useCallback(() => {
    userPausedRef.current = false
    setIsPaused(false)
    pushDL('hero_resumed_user')
  }, [])

  const autoPause = useCallback(() => {
    if (userPausedRef.current) return
    setIsPaused(true)
  }, [])

  const autoResume = useCallback(() => {
    if (userPausedRef.current) return
    setIsPaused(false)
  }, [])

  const runManualAction = useCallback(
    (action: () => void) => {
      const shouldResume = !userPausedRef.current && effectiveAutoplay
      if (shouldResume) setIsPaused(true)
      action()
      setProgress(0)
      if (shouldResume) {
        requestAnimationFrame(() => setIsPaused(false))
      }
    },
    [effectiveAutoplay]
  )

  useEffect(() => {
    setProgress(0)
  }, [index])

  useEffect(() => {
    if (!effectiveAutoplay || isPaused) return

    let rafId = 0
    const start = performance.now() - (progress / 100) * intervalMs

    const tick = (now: number) => {
      const elapsed = now - start
      const ratio = elapsed / intervalMs

      if (ratio >= 1) {
        setProgress(100)
        next()
        return
      }

      setProgress(ratio * 100)
      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [effectiveAutoplay, intervalMs, isPaused, next, progress])

  useEffect(() => {
    if (!pauseWhenHidden) return

    const onVisibilityChange = () => {
      if (document.hidden) autoPause()
      else autoResume()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [autoPause, autoResume, pauseWhenHidden])

  useEffect(() => {
    if (!pauseWhenHidden || typeof window === 'undefined') return

    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting
        if (visible) autoResume()
        else autoPause()
      },
      { threshold: 0.4 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [autoPause, autoResume, pauseWhenHidden])

  useEffect(() => {
    if (typeof window === 'undefined' || !canNavigate) return

    const nextIdx = (index + 1) % total
    const prevIdx = (index - 1 + total) % total
    const nextSlide = slides[nextIdx]
    const prevSlide = slides[prevIdx]

    const urls = [
      getImageSrc(nextSlide).desktop,
      getImageSrc(nextSlide).mobile,
      getImageSrc(prevSlide).desktop,
      getImageSrc(prevSlide).mobile,
    ].filter(Boolean)

    urls.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [canNavigate, index, slides, total])

  useEffect(() => {
    if (current) onSlideChange?.(index, current)

    try {
      const el = document.getElementById(srId)
      if (el) {
        el.textContent = `${t.slideWord}${index + 1}${t.of}${total}${current?.alt ? `: ${current.alt}` : ''}`
      }
    } catch {
      // no-op
    }
  }, [current, index, onSlideChange, srId, t, total])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (current?.videoUrl) {
      if (!isPaused && effectiveAutoplay) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    }
  }, [current?.videoUrl, effectiveAutoplay, isPaused])

  const onTouchStart: TouchEventHandler<HTMLDivElement> = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
    if (pauseOnHover && effectiveAutoplay) autoPause()
  }

  const onTouchEnd: TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX.current == null) {
      if (pauseOnHover && effectiveAutoplay) autoResume()
      return
    }

    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(delta) > swipeThreshold) {
      runManualAction(() => {
        if (delta > 0) prev()
        else next()
      })
    }

    if (pauseOnHover && effectiveAutoplay) autoResume()
  }

  const onTouchCancel: TouchEventHandler<HTMLDivElement> = () => {
    touchStartX.current = null
    if (pauseOnHover && effectiveAutoplay) autoResume()
  }

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === 'ArrowRight') {
      runManualAction(next)
    } else if (e.key === 'ArrowLeft') {
      runManualAction(prev)
    } else if (e.key === 'Home') {
      runManualAction(() => setIndex(0))
    } else if (e.key === 'End') {
      runManualAction(() => setIndex(canNavigate ? total - 1 : 0))
    } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
      e.preventDefault()
      if (userPausedRef.current) resumeUser()
      else pauseUser()
    }
  }

  const onFocusCapture: FocusEventHandler<HTMLElement> = () => {
    if (pauseOnHover && effectiveAutoplay) autoPause()
  }

  const onBlurCapture: FocusEventHandler<HTMLElement> = (e) => {
    if (!pauseOnHover || !effectiveAutoplay) return
    const nextTarget = e.relatedTarget as Node | null
    if (nextTarget && e.currentTarget.contains(nextTarget)) return
    autoResume()
  }

  if (total === 0) return null

  const localizedHref = (href?: string) => localizePath(href || '/products', locale)
  const slideAria = `${index + 1} / ${total}${current?.alt ? ` — ${current.alt}` : ''}`
  const { desktop: desktopSrc, mobile: mobileSrc } = getImageSrc(current)

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative w-full select-none overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-black/85 via-black/75 to-black/90 shadow-[0_28px_80px_rgba(0,0,0,0.65)]',
        'h-[58vh] sm:h-[70vh] lg:h-[82vh] will-change-transform touch-pan-y',
        className
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.mainLabel}
      aria-describedby={instructionsId}
      aria-live="off"
      onMouseEnter={pauseOnHover && effectiveAutoplay ? autoPause : undefined}
      onMouseLeave={pauseOnHover && effectiveAutoplay ? autoResume : undefined}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      tabIndex={0}
    >
      <span id={srId} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
      <p id={instructionsId} className="sr-only">
        {t.instructions}
      </p>

      {edgeFade ? (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-black/55 via-black/10 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-black/55 via-black/10 to-transparent"
            aria-hidden="true"
          />
        </>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={String(current?.id)}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.01 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0.25, scale: 0.99 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          className="absolute inset-0 z-0 will-change-transform"
          style={parallaxStyle}
          aria-roledescription="slide"
          aria-label={slideAria}
        >
          <motion.div
            key={`kb-${String(current?.id)}`}
            initial={{ scale: 1.02 }}
            animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.07 }}
            transition={{ duration: intervalMs / 1000, ease: 'linear' }}
            className="absolute inset-0 will-change-transform"
          >
            {current?.videoUrl ? (
              <video
                ref={videoRef}
                key={String(current.videoUrl)}
                className="h-full w-full object-cover"
                playsInline
                muted
                loop
                autoPlay={effectiveAutoplay && !isPaused}
                preload="metadata"
                poster={current.poster || desktopSrc}
                disablePictureInPicture
                controls={false}
                onPlay={(e: SyntheticEvent<HTMLVideoElement>) => {
                  if (userPausedRef.current) {
                    e.currentTarget.pause()
                  }
                }}
              >
                <source src={current.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <>
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
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
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
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="overlay-hero absolute inset-0" />
        {showOverlay ? (
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80"
            style={overlayOpacity ? { opacity: overlayOpacity } : undefined}
          />
        ) : null}
        <div
          className="absolute inset-0 opacity-70 mix-blend-overlay"
          style={{ background: 'var(--ring-conic)' }}
        />
      </div>

      {current?.badge ? (
        <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-black shadow-[0_12px_35px_rgba(15,23,42,0.42)] dark:bg-black/70 dark:text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))] shadow-[0_0_0_4px_rgba(20,184,166,0.25)]" />
            {current.badge}
          </span>
        </div>
      ) : null}

      {showCounter && canNavigate ? (
        <div className="glass absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
          {index + 1}{' '}
          <span className="mx-1.5 h-[1px] w-6 align-middle bg-gradient-to-r from-white/0 via-white/60 to-white/0" />{' '}
          {total}
        </div>
      ) : null}

      {current?.text || current?.ctaLabel ? (
        <div className="absolute inset-0 z-10 grid place-items-center px-5 text-left sm:px-10">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 sm:gap-7 md:gap-8">
            {current?.text ? (
              <h2
                className={cn(
                  'max-w-xl font-semibold tracking-tight text-white drop-shadow-[0_22px_55px_rgba(0,0,0,0.9)] sm:max-w-3xl',
                  'bg-gradient-to-b from-white via-white to-white/85 bg-clip-text text-transparent',
                  TEXT_SIZES[textSize]
                )}
              >
                {current.text}
              </h2>
            ) : null}

            {current?.ctaLabel ? (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href={localizedHref(current.ctaLink)}
                  prefetch={false}
                  className={cn(
                    'inline-flex items-center gap-2.5 rounded-full px-6 py-2.5 text-sm font-semibold text-slate-950 sm:px-8 sm:py-3 sm:text-[15px]',
                    'bg-[hsl(var(--accent))] shadow-[0_18px_45px_rgba(20,184,166,0.55)] transition-all duration-200',
                    'hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(20,184,166,0.75)] active:translate-y-0 active:shadow-[0_10px_30px_rgba(20,184,166,0.55)]',
                    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
                  )}
                  aria-label={`${current.ctaLabel}${current.alt ? ` — ${current.alt}` : ''}`}
                  data-gtm="home_hero_cta"
                  data-slide-id={String(current.id)}
                  onClick={() => pushDL('hero_cta', { slideId: current.id })}
                >
                  {current.ctaLabel || t.ctaFallback}
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="opacity-90"
                  >
                    <path
                      fill="currentColor"
                      d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"
                    />
                  </svg>
                </Link>
                {current.alt ? (
                  <p className="max-w-xs text-xs font-medium text-white/70 sm:max-w-sm sm:text-[13px]">
                    {current.alt}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {canNavigate ? (
        <>
          <button
            type="button"
            aria-label={t.prev}
            className={cn(
              'group absolute left-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white shadow-[0_10px_32px_rgba(15,23,42,0.6)] backdrop-blur-xl',
              'hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/50 sm:left-4 sm:h-11 sm:w-11',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
            )}
            data-gtm="hero_prev"
            onClick={() => runManualAction(prev)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            >
              <path fill="currentColor" d="M15.78 19.78L8 12l7.78-7.78l1.44 1.44L10.88 12l6.34 6.34z" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={t.next}
            className={cn(
              'group absolute right-2 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white shadow-[0_10px_32px_rgba(15,23,42,0.6)] backdrop-blur-xl',
              'hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/50 sm:right-4 sm:h-11 sm:w-11',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
            )}
            data-gtm="hero_next"
            onClick={() => runManualAction(next)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path fill="currentColor" d="M8.22 4.22L16 12l-7.78 7.78l-1.44-1.44L13.12 12L6.78 5.66z" />
            </svg>
          </button>
        </>
      ) : null}

      {showPlayPause && canNavigate ? (
        <button
          type="button"
          onClick={() => {
            if (userPausedRef.current) resumeUser()
            else pauseUser()
          }}
          aria-label={isPaused ? t.play : t.pause}
          aria-pressed={isPaused}
          className={cn(
            'absolute right-3 top-3 z-20 rounded-full border border-white/15 bg-black/40 px-3.5 py-2 text-[11px] font-medium text-white backdrop-blur-xl',
            'hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60'
          )}
          data-gtm="hero_toggle"
        >
          <span className="inline-flex items-center gap-1.5">
            {isPaused ? <IconPlay /> : <IconPause />}
            <span>{isPaused ? t.btnPlay : t.btnPause}</span>
          </span>
        </button>
      ) : null}

      {effectiveAutoplay ? (
        <div
          className="absolute bottom-6 left-1/2 z-20 hidden h-[5px] w-[70%] max-w-3xl -translate-x-1/2 overflow-hidden rounded-full border border-white/15 bg-black/50 backdrop-blur-xl sm:block"
          role="presentation"
          aria-hidden="true"
          onClick={(e) => {
            if (!progressClickable || !canNavigate) return

            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            const target = Math.min(total - 1, Math.floor(ratio * total))

            runManualAction(() => setIndex(target))
            pushDL('hero_seek', { target })
          }}
          style={progressClickable ? { cursor: 'pointer' } : undefined}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--accent))] via-sky-300 to-white"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      ) : null}

      {showBullets && canNavigate ? (
        <nav className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 sm:hidden" aria-label={t.nav}>
          <ul className="flex items-center gap-2.5 rounded-full bg-black/40 px-3 py-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.75)] backdrop-blur-xl">
            {slides.map((slide, i) => {
              const active = i === index
              const bulletLabel = t.goTo + (i + 1) + (slide.alt ? ` : ${slide.alt}` : '')

              return (
                <li key={slide.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'h-2.5 w-2.5 rounded-full transition',
                      active
                        ? 'scale-110 bg-[hsl(var(--accent))] shadow-[0_0_0_2px_rgba(15,23,42,0.8)]'
                        : 'bg-white/40 hover:bg-white/85'
                    )}
                    aria-label={bulletLabel}
                    aria-current={active ? 'true' : undefined}
                    data-gtm="hero_bullet"
                    data-idx={i}
                    onClick={() => runManualAction(() => setIndex(i))}
                  />
                </li>
              )
            })}
          </ul>
        </nav>
      ) : null}

      {showThumbnails && canNavigate ? (
        <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 sm:block">
          <ul className="flex gap-3 rounded-full bg-black/40 px-3 py-2 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-2xl" aria-label={t.thumbs}>
            {slides.map((slide, i) => {
              const active = i === index
              const thumb = getImageSrc(slide).desktop

              return (
                <li key={slide.id ?? i}>
                  <button
                    type="button"
                    className={cn(
                      'group relative h-10 w-16 overflow-hidden rounded-xl border border-white/15 shadow-[0_10px_35px_rgba(15,23,42,0.85)] sm:h-12 sm:w-20',
                      active
                        ? 'border-[hsl(var(--accent))] ring-2 ring-[hsl(var(--accent))]'
                        : 'hover:border-white/70'
                    )}
                    aria-label={`${t.goTo}${i + 1}`}
                    aria-current={active ? 'true' : undefined}
                    data-gtm="hero_thumb"
                    data-idx={i}
                    onClick={() => runManualAction(() => setIndex(i))}
                  >
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover brightness-[1.08] contrast-[1.05] transition-transform duration-300 group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      draggable={false}
                    />
                    <span className="sr-only">
                      {slide.alt ? slide.alt : `${t.goTo}${i + 1}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <noscript>
        <p className="mt-2 text-center">
          <a href="/products">{t.noscriptProducts}</a>
        </p>
      </noscript>
    </section>
  )
}