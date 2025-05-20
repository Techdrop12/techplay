'use client'

import { useEffect, useState } from 'react'
import '@/styles/hero-carousel.css'

const slides = [
  { title: 'Casques Gaming', img: '/carousel1.jpg' },
  { title: 'Souris RGB', img: '/carousel2.jpg' },
  { title: 'Claviers Mécaniques', img: '/carousel3.jpg' },
]

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="carousel">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`slide ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.img})` }}
        >
          <div className="overlay">
            <h2>{slide.title}</h2>
          </div>
        </div>
      ))}
    </div>
  )
}
