'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant =
  | 'accent'      // bouton principal (couleur de marque)
  | 'secondary'   // surface neutre
  | 'outline'     // bordure
  | 'ghost'       // transparent
  | 'soft'        // fond subtil
  | 'danger'      // action destructive
  | 'link'        // lien déguisé en bouton

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  disabled?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed'

const sizes: Record<Size, string> = {
  xs: 'px-2.5 py-1.5 text-[12px]',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-lg',
  xl: 'px-6 py-3.5 text-[1.1rem]',
}

const variants: Record<Variant, string> = {
  accent: 'bg-accent text-white hover:bg-accent/90',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700',
  outline:
    'border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800',
  ghost:
    'bg-transparent text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-zinc-800',
  soft:
    'bg-accent/10 text-accent hover:bg-accent/15 ring-1 ring-inset ring-accent/20',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  link:
    'bg-transparent text-accent hover:text-accent/80 underline underline-offset-2 decoration-2',
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 opacity-90"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  )
}

export default function Button({
  variant = 'accent',
  size = 'md',
  className,
  fullWidth,
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      data-variant={variant}
      data-size={size}
      className={cn(
        base,
        sizes[size],
        variants[variant],
        fullWidth && 'w-full',
        loading && 'cursor-progress',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span>Patientez…</span>
        </>
      ) : (
        <>
          {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
          <span>{children}</span>
          {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
        </>
      )}
    </button>
  )
}
