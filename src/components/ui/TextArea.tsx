// src/components/ui/TextArea.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg'
type Variant = 'solid' | 'outline' | 'ghost'

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: React.ReactNode
  help?: React.ReactNode
  error?: React.ReactNode
  size?: Size
  variant?: Variant
  fullWidth?: boolean
  /** Auto-redimensionnement selon le contenu */
  autoGrow?: boolean
  /** Affiche le compteur si maxLength est défini */
  showCount?: boolean
  containerClassName?: string
  textareaClassName?: string
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[2.5rem] px-3 py-2 text-sm rounded-lg',
  md: 'min-h-[3rem] px-3.5 py-2.5 text-base rounded-xl',
  lg: 'min-h-[3.5rem] px-4 py-3 text-lg rounded-xl',
}

const variantClasses: Record<Variant, string> = {
  solid:
    'bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900',
  outline:
    'bg-transparent border border-gray-300 dark:border-zinc-700',
  ghost:
    'bg-transparent border border-transparent',
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      id,
      label,
      help,
      error,
      size = 'md',
      variant = 'outline',
      fullWidth = true,
      className,
      containerClassName,
      textareaClassName,
      autoGrow = true,
      showCount = true,
      maxLength,
      required,
      ...props
    },
    ref
  ) {
    const autoId = React.useId()
    const textareaId = id ?? `ta-${autoId}`
    const helpId = help ? `${textareaId}-help` : undefined
    const errorId = error ? `${textareaId}-error` : undefined
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined

    const innerRef = React.useRef<HTMLTextAreaElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement)

    const resize = React.useCallback(() => {
      const el = innerRef.current
      if (!el || !autoGrow) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoGrow])

    React.useEffect(() => {
      resize()
    }, [resize, props.value])

    return (
      <div className={cn('w-full', fullWidth && 'block', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {label}
            {required ? (
              <>
                <span aria-hidden="true" className="text-red-600"> *</span>
                <span className="sr-only"> (obligatoire)</span>
              </>
            ) : null}
          </label>
        )}

        <div className="relative">
          <textarea
            id={textareaId}
            ref={innerRef}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            aria-errormessage={error ? errorId : undefined}
            required={required}
            onInput={(e) => {
              props.onInput?.(e)
              if (autoGrow) resize()
            }}
            className={cn(
              'w-full text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'resize-y', // Tailwind: redimension vertical par l’utilisateur
              sizeClasses[size],
              variantClasses[variant],
              error ? 'border-red-500 focus-visible:ring-red-500' : undefined,
              textareaClassName,
              className
            )}
            {...props}
          />

          {maxLength && showCount ? (
            <div
              aria-live="polite"
              className="pointer-events-none absolute bottom-1.5 right-2 text-xs text-gray-500 dark:text-gray-400"
            >
              {String(props.value ?? '').length}/{maxLength}
            </div>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        ) : help ? (
          <p id={helpId} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            {help}
          </p>
        ) : null}
      </div>
    )
  }
)

export default TextArea
