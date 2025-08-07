'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
  priority?: boolean
}

export default function Logo({ className = '', priority = false }: LogoProps) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="img"
      aria-label="Logo TechPlay"
    >
      <Image
        src="/logo.png"
        alt="Logo TechPlay – Accueil"
        width={48}
        height={48}
        priority={priority}
        sizes="(max-width: 768px) 40px, 48px"
        className="h-10 w-auto sm:h-12"
      />
      <span className="text-xl sm:text-2xl font-bold tracking-tight text-brand dark:text-brand-light">
        TechPlay
      </span>
    </div>
  )
}
