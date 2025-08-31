// src/components/Container.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Largeur max du conteneur (par défaut: 7xl) */
  max?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  /** Gouttières horizontales */
  gutter?: 'none' | 'sm' | 'md' | 'lg'
  /** Centrer le bloc (mx-auto) — true par défaut */
  center?: boolean
  /** Alias pratique pour max="full" */
  fluid?: boolean
  /** Ignore les gouttières (px-0) pour “bleeder” jusqu’aux bords */
  bleed?: boolean
}

const MAX: Record<NonNullable<ContainerProps['max']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-none',
}

const GUTTER: Record<NonNullable<ContainerProps['gutter']>, string> = {
  none: 'px-0',
  sm: 'px-3',
  md: 'px-4 sm:px-6 lg:px-8',     // équivalent à ta version historique
  lg: 'px-6 sm:px-8 lg:px-12',
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  {
    className,
    max = '7xl',
    gutter = 'md',
    center = true,
    fluid,
    bleed = false,
    ...props
  },
  ref
) {
  const actualMax = fluid ? 'full' : max

  return (
    <div
      ref={ref}
      className={cn(
        'w-full',
        center && 'mx-auto',
        MAX[actualMax],
        bleed ? 'px-0' : GUTTER[gutter],
        className
      )}
      {...props}
    />
  )
})

export default Container
