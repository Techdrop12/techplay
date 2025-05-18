'use client'
import Image from 'next/image'

export default function HeroCarousel() {
  return (
    <div className="w-full overflow-hidden rounded-lg">
      <Image
        src="/logo.png"
        alt="Hero"
        width={1200}
        height={400}
        className="w-full object-cover"
      />
    </div>
  )
}
