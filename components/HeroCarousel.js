'use client'
import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import '@/app/styles/hero-carousel.css'

const HeroCarousel = () => {
  const carouselRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="carousel-container">
      <div className="carousel" ref={carouselRef}>
        <img src="/banner-1.png" alt="Banner 1" />
        <img src="/banner-2.png" alt="Banner 2" />
        <img src="/banner-3.png" alt="Banner 3" />
      </div>
      <div className="carousel-buttons">
        <button onClick={() => carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' })}>
          <ChevronLeft />
        </button>
        <button onClick={() => carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })}>
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}

export default HeroCarousel
