// src/components/Logo.tsx
'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
  priority?: boolean
}

export default function Logo({ className = '', priority = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Logo TechPlay"
        width={40}
        height={40}
        priority={priority}
      />
      <span className="text-xl font-bold tracking-tight">TechPlay</span>
    </div>
  )
}
