'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Slide {
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
  className?: string
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    image: '/carousel1.jpg',
    alt: 'Casques Gaming',
    text: 'Casques Gaming – Immersion totale',
    ctaLabel: 'Découvrir',
    ctaLink: '/produit/casque-gaming',
  },
  {
    id: 2,
    image: '/carousel2.jpg',
    alt: 'Souris RGB',
    text: 'Souris RGB – Précision & Style',
    ctaLabel: 'Explorer',
    ctaLink: '/produit/souris-rgb',
  },
  {
    id: 3,
    image: '/carousel3.jpg',
    alt: 'Claviers Mécaniques',
    text: 'Claviers Mécaniques – Réactivité ultime',
    ctaLabel: 'Voir plus',
    ctaLink: '/produit/clavier-mecanique',
  },
]

export default function HeroCarousel({
  slides = defaultSlides,
  intervalMs = 7000,
  showOverlay = true,
  overlayOpacity = 0.4,
  textSize = 'xl',
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPausedRef = useRef(false)

  const advanceSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!isPausedRef.current) {
      intervalRef.current = setInterval(advanceSlide, intervalMs)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [advanceSlide, intervalMs, index])

  const pause = () => {
    isPausedRef.current = true
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
  const resume = () => {
    isPausedRef.current = false
    intervalRef.current = setInterval(advanceSlide, intervalMs)
  }

  const textSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-5xl sm:text-6xl',
    xl: 'text-6xl sm:text-7xl',
  }

  return (
    <section
      className={cn(
        'relative h-[92vh] w-full overflow-hidden rounded-none sm:rounded-2xl shadow-2xl select-none',
        className
      )}
      aria-label="Carrousel principal TechPlay"
    >
      <AnimatePresence initial={false} mode="wait">
        {slides.map(
          (slide, i) =>
            i === index && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10"
                aria-hidden={i !== index}
                onMouseEnter={pause}
                onMouseLeave={resume}
                onFocus={pause}
                onBlur={resume}
                tabIndex={-1}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover brightness-75"
                  priority={i === 0}
                  placeholder="blur"
                  blurDataURL="/placeholder-blur.png"
                />
                {showOverlay && (
                  <div
                    className="absolute inset-0 flex flex-col justify-center items-center px-6 sm:px-12"
                    style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
                  >
                    {slide.text && (
                      <h2
                        className={cn(
                          'text-white font-extrabold drop-shadow-xl mb-6 animate-fadeIn',
                          textSizes[textSize]
                        )}
                      >
                        {slide.text}
                      </h2>
                    )}
                    {slide.ctaLabel && slide.ctaLink && (
                      <a
                        href={slide.ctaLink}
                        className="inline-block rounded-xl bg-accent px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-accent/90 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-accent/60 transition-transform transform active:scale-95 animate-slideUp"
                        tabIndex={0}
                      >
                        {slide.ctaLabel}
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-6 left-1/2 w-2/3 -translate-x-1/2 rounded-full bg-white/30 h-2 overflow-hidden" aria-hidden="true">
        <motion.div
          className="bg-accent h-full rounded-full"
          animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
          transition={{ duration: intervalMs / 1000, ease: 'linear' }}
        />
      </div>

      {/* Pagination bullets */}
      <nav
        className="absolute bottom-3 left-1/2 flex gap-4 -translate-x-1/2 z-20"
        aria-label="Changer de diapositive"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'w-4 h-4 rounded-full transition-colors focus:outline-none',
              i === index ? 'bg-accent' : 'bg-accent/40 hover:bg-accent/80'
            )}
            aria-current={i === index ? 'true' : undefined}
            aria-label={`Diapositive ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </nav>
    </section>
  )
}
