// src/components/Input.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'solid' | 'outline' | 'ghost'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label au-dessus du champ (optionnel) */
  label?: React.ReactNode
  /** Texte d’aide (sous le champ) */
  help?: React.ReactNode
  /** Message d’erreur (style erreur + a11y) */
  error?: React.ReactNode
  /** Taille visuelle */
  size?: Size
  /** Style visuel */
  variant?: Variant
  /** Largeur 100% */
  fullWidth?: boolean
  /** Icônes décoratives à gauche / droite */
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  /** Classes supplémentaires */
  inputClassName?: string
  containerClassName?: string
  /** Afficher le bouton pour révéler un mot de passe si type="password" */
  showPasswordToggle?: boolean
  /** Afficher un bouton pour effacer le champ (contrôlé de préférence) */
  clearable?: boolean
}

const sizeClasses: Record<Size, string> = {
  xs: 'h-8 px-2 text-xs rounded-lg',
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-10 px-3.5 text-base rounded-xl',
  lg: 'h-11 px-4 text-lg rounded-xl',
  xl: 'h-12 px-4 text-[1.05rem] rounded-2xl',
}

const variantClasses: Record<Variant, string> = {
  solid:
    'bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900',
  outline:
    'bg-transparent border border-gray-300 dark:border-zinc-700',
  ghost:
    'bg-transparent border border-transparent',
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 5c-5 0-9.27 3.11-10.5 7 1.23 3.89 5.5 7 10.5 7s9.27-3.11 10.5-7C21.27 8.11 17 5 12 5Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
        fill="currentColor"
      />
    </svg>
  )
}
function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3 4.27 4.28 3 21 19.72 19.73 21l-2.09-2.09A11.87 11.87 0 0 1 12 19C7 19 2.73 15.89 1.5 12a12.64 12.64 0 0 1 4.05-5.45L3 4.27ZM12 7a5 5 0 0 1 4.9 6.09l-1.72-1.72A3 3 0 0 0 10.63 6.9 5.06 5.06 0 0 1 12 7Zm0 10a9.86 9.86 0 0 0 4.29-1l-2-2A5 5 0 0 1 7 12a5 5 0 0 1 .87-2.79L5.25 6.59A10.81 10.81 0 0 0 3 12c1.23 3.89 5.5 7 9 7Z"
        fill="currentColor"
      />
    </svg>
  )
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      label,
      help,
      error,
      size = 'md',
      variant = 'outline',
      fullWidth = true,
      className,
      inputClassName,
      containerClassName,
      leadingIcon,
      trailingIcon,
      type = 'text',
      showPasswordToggle = true,
      clearable = false,
      required,
      autoComplete,
      inputMode,
      spellCheck,
      ...props
    },
    ref
  ) {
    const autoId = React.useId()
    const inputId = id ?? `inp-${autoId}`
    const helpId = help ? `${inputId}-help` : undefined
    const errorId = error ? `${inputId}-error` : undefined
    const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined

    const [reveal, setReveal] = React.useState(false)
    const isPassword = type === 'password'
    const effectiveType = isPassword && reveal ? 'text' : type

    // Valeurs par défaut intelligentes (sans écraser les props)
    const effectiveAutoComplete =
      autoComplete ??
      (isPassword ? 'current-password' :
       type === 'email' ? 'email' :
       type === 'tel' ? 'tel' :
       type === 'search' ? 'search' : undefined)

    const effectiveInputMode =
      inputMode ??
      (type === 'email' ? 'email' :
       type === 'tel' ? 'tel' :
       type === 'url' ? 'url' :
       type === 'search' ? 'search' :
       type === 'number' ? 'decimal' : undefined)

    const effectiveSpellCheck =
      spellCheck ?? (type === 'email' || isPassword ? false : undefined)

    const hasError = Boolean(error)

    // Clearable (affichage surtout utile en contrôle)
    const controlledValue = (props as any)?.value
    const showClear =
      clearable && !isPassword && controlledValue != null && String(controlledValue).length > 0

    // ref interne pour clear/mesures
    const innerRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    const clearValue = () => {
      const el = innerRef.current
      if (!el) return
      // Vide la valeur et déclenche un event input pour synchroniser les states contrôlés
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(el, '')
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.focus()
    }

    return (
      <div className={cn('w-full', fullWidth && 'block', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
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
          {leadingIcon ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 grid w-10 place-items-center text-gray-500"
            >
              {leadingIcon}
            </span>
          ) : null}

          <input
            id={inputId}
            ref={innerRef}
            type={effectiveType}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-errormessage={hasError ? errorId : undefined}
            required={required}
            autoComplete={effectiveAutoComplete}
            inputMode={effectiveInputMode}
            spellCheck={effectiveSpellCheck}
            className={cn(
              'w-full text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              sizeClasses[size],
              variantClasses[variant],
              leadingIcon ? 'pl-10' : undefined,
              (trailingIcon || isPassword || showClear) ? 'pr-10' : undefined,
              hasError ? 'border-red-500 focus-visible:ring-red-500' : undefined,
              inputClassName,
              className
            )}
            {...props}
          />

          {/* Zone d’icônes à droite : clear > eye-toggle > trailingIcon */}
          {showClear ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Effacer le contenu"
              onClick={clearValue}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-600 hover:text-gray-800 dark:text-gray-300"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          ) : isPassword && showPasswordToggle ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={reveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setReveal((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-600 dark:text-gray-300"
            >
              {reveal ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          ) : trailingIcon ? (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-500"
            >
              {trailingIcon}
            </span>
          ) : null}
        </div>

        {hasError ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1.5 text-sm text-red-600"
          >
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

export default Input
