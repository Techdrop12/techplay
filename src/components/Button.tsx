'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type NativeProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export interface ButtonProps extends Omit<NativeProps, 'disabled'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  /** Désactive le bouton ET applique le style disabled */
  disabled?: boolean
  /** Affiche un spinner + aria-busy */
  loading?: boolean
  /** Étire le bouton à 100% */
  fullWidth?: boolean
  /** Icônes facultatives (gauche/droite) */
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent/40',
  secondary:
    'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 focus-visible:ring-gray-400/40',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40',
  outline:
    'border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800',
  ghost:
    'text-gray-900 dark:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-zinc-800/70'
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-base rounded-xl',
  lg: 'h-13 px-6 text-lg rounded-2xl',
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-4 w-4', className)}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4" fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}

/** Bouton accessible, focus-visible, variants + spinner */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    disabled = false,
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors shadow-sm',
        'focus:outline-none focus-visible:ring-4 ring-offset-0',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading && (
        <>
          <Spinner />
          <span className="sr-only">Chargement…</span>
        </>
      )}
      {!loading && leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
})

export default Button
