'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const slides = [
  {
    id: 1,
    image: '/images/hero1.jpg',
    alt: 'TechPlay hero 1',
    text: 'Les accessoires high-tech les plus innovants',
  },
  {
    id: 2,
    image: '/images/hero2.jpg',
    alt: 'TechPlay hero 2',
    text: 'Des gadgets stylés, utiles, indispensables',
  },
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-96 overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h2 className="text-white text-2xl md:text-4xl font-bold text-center px-4">
              {slide.text}
            </h2>
          </div>
        </div>
      ))}
    </section>
  )
}
