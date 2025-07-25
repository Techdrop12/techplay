'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
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
    ctaLabel: 'Découvrir',
    ctaLink: '/produit/souris-rgb',
  },
  {
    id: 3,
    image: '/carousel3.jpg',
    alt: 'Claviers Mécaniques',
    text: 'Claviers Mécaniques – Réactivité ultime',
    ctaLabel: 'Découvrir',
    ctaLink: '/produit/clavier-mecanique',
  },
]

export default function HeroCarousel({
  slides = defaultSlides,
  intervalMs = 6000,
  showOverlay = true,
  overlayOpacity = 0.5,
  textSize = 'xl',
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, intervalMs)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [intervalMs, slides.length])

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl',
    xl: 'text-5xl',
  }

  return (
    <section
      className={cn(
        'relative h-[90vh] w-full overflow-hidden rounded-lg shadow-2xl',
        className
      )}
      aria-label="Carrousel principal des produits"
      role="region"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 flex flex-col justify-center items-center px-6 text-center transition-opacity duration-1200 ease-in-out',
            i === index ? 'opacity-100 z-20' : 'opacity-0 z-0',
            'pointer-events-none'
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover brightness-75"
            priority={i === 0}
          />
          {showOverlay && (
            <div
              className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center px-4"
              style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
            >
              {slide.text && (
                <h2
                  className={cn(
                    'text-white font-extrabold drop-shadow-lg mb-6 animate-fadeIn',
                    textSizes[textSize]
                  )}
                >
                  {slide.text}
                </h2>
              )}
              {slide.ctaLabel && slide.ctaLink && (
                <a
                  href={slide.ctaLink}
                  className="inline-block rounded-md bg-accent px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/70 transition-transform transform hover:scale-105 active:scale-95"
                >
                  {slide.ctaLabel}
                </a>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Progress bar */}
      <div className="absolute bottom-6 left-1/2 w-2/3 -translate-x-1/2 rounded-full bg-white/20 h-2 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-[6000ms] ease-linear"
          style={{ width: `${((index + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Pagination buttons */}
      <nav
        className="absolute bottom-4 left-1/2 flex gap-4 -translate-x-1/2"
        aria-label="Changer de diapositive"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'w-4 h-4 rounded-full transition-colors',
              i === index ? 'bg-accent' : 'bg-accent/50 hover:bg-accent'
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
