import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  role?: string
}

export default function SectionWrapper({
  children,
  className,
  role = 'region',
}: Props) {
  return (
    <section
      className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12', className)}
      role={role}
    >
      {children}
    </section>
  )
}