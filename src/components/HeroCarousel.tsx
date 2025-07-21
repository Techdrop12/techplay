'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Slide {
  id: number
  image: string
  alt: string
  text?: string
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
  },
  {
    id: 2,
    image: '/carousel2.jpg',
    alt: 'Souris RGB',
    text: 'Souris RGB – Précision & Style',
  },
  {
    id: 3,
    image: '/carousel3.jpg',
    alt: 'Claviers Mécaniques',
    text: 'Claviers Mécaniques – Réactivité ultime',
  },
]

export default function HeroCarousel({
  slides = defaultSlides,
  intervalMs = 5000,
  showOverlay = true,
  overlayOpacity = 0.4,
  textSize = 'xl',
  className,
}: HeroCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs, slides.length])

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }

  return (
    <section
      className={cn(
        'relative h-96 w-full overflow-hidden',
        'rounded-lg shadow-md',
        className
      )}
      aria-label="Hero carousel"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
          />
          {showOverlay && (
            <div
              className="absolute inset-0 flex items-center justify-center px-4 text-center"
              style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
            >
              {slide.text && (
                <h2
                  className={cn(
                    'text-white font-bold drop-shadow',
                    textSizes[textSize]
                  )}
                >
                  {slide.text}
                </h2>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}
