'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value?: number
  defaultValue?: number
  onChange?: (val: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  id?: string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  'aria-describedby'?: string
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

export default function QuantitySelector({
  value,
  defaultValue,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  className,
  id,
  name,
  disabled = false,
  readOnly = false,
  'aria-describedby': ariaDescribedBy,
}: QuantitySelectorProps) {
  const prefersReducedMotion = useReducedMotion()

  const isControlled = typeof value === 'number'
  const [internal, setInternal] = useState<number>(() =>
    clamp(
      typeof defaultValue === 'number' ? defaultValue : (typeof value === 'number' ? value : min),
      min,
      max
    )
  )

  const qty = isControlled ? clamp(value!, min, max) : internal

  useEffect(() => {
    // si min/max changent, on re-clamp la valeur courante
    if (!isControlled) {
      setInternal((v) => clamp(v, min, max))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max])

  // sync vers interne si parent passe une value
  useEffect(() => {
    if (isControlled) {
      setInternal(qty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const emit = useCallback(
    (n: number) => {
      const next = clamp(n, min, max)
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, min, max, onChange]
  )

  const changeBy = useCallback(
    (delta: number) => {
      const next = (qty ?? min) + delta
      emit(next)
    },
    [emit, qty, min]
  )

  // Auto-repeat (maintien appuyé)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const repeatStart = (delta: number) => (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault()
    changeBy(delta)
    // délai avant répétition
    pressTimer.current && clearTimeout(pressTimer.current)
    pressInterval.current && clearInterval(pressInterval.current)
    let speed = 120
    let count = 0
    pressTimer.current = setTimeout(() => {
      pressInterval.current = setInterval(() => {
        changeBy(delta)
        count++
        // accélération légère
        if (count % 6 === 0) speed = Math.max(40, speed - 10)
      }, speed)
    }, 350)
    window.addEventListener('pointerup', repeatStop, { once: true })
    window.addEventListener('mouseup', repeatStop, { once: true })
    window.addEventListener('touchend', repeatStop, { once: true })
  }
  const repeatStop = () => {
    pressTimer.current && clearTimeout(pressTimer.current)
    pressInterval.current && clearInterval(pressInterval.current)
    pressTimer.current = null
    pressInterval.current = null
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      // laisse vider le champ mais ne notifie pas
      if (!isControlled) setInternal(min)
      return
    }
    const n = Number(raw)
    if (Number.isNaN(n)) return
    emit(n)
  }

  const onInputBlur = () => {
    // au blur, on re-clamp proprement
    emit(qty)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      changeBy(step)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      changeBy(-step)
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      changeBy(step * 10)
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      changeBy(-step * 10)
    } else if (e.key === 'Home') {
      e.preventDefault()
      emit(min)
    } else if (e.key === 'End') {
      e.preventDefault()
      emit(max)
    }
  }

  const onWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (document.activeElement !== e.currentTarget) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -step : step
    changeBy(delta)
  }

  const minusDisabled = disabled || readOnly || qty <= min
  const plusDisabled = disabled || readOnly || qty >= max

  const srText = useMemo(() => `Quantité ${qty}`, [qty])

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Région live pour a11y */}
      <span className="sr-only" role="status" aria-live="polite">
        {srText}
      </span>

      <motion.button
        type="button"
        whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
        onPointerDown={repeatStart(-step)}
        onMouseDown={repeatStart(-step)}
        onKeyDown={(e) => e.key === 'Enter' && changeBy(-step)}
        onContextMenu={(e) => e.preventDefault()}
        disabled={minusDisabled}
        className={cn(
          'px-3 py-1 border rounded-md text-lg font-bold transition',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600',
          minusDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
        )}
        aria-label="Diminuer la quantité"
      >
        −
      </motion.button>

      <motion.input
        key={qty} // petit bump visuel optionnel
        initial={prefersReducedMotion ? false : { scale: 0.98, opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.12 }}
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        min={min}
        max={max}
        step={step}
        value={qty}
        onChange={onInputChange}
        onBlur={onInputBlur}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        disabled={disabled}
        readOnly={readOnly}
        aria-describedby={ariaDescribedBy}
        aria-live="off"
        className={cn(
          'w-16 text-center font-semibold text-lg',
          'border rounded-md py-1.5 px-2 bg-white dark:bg-zinc-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600'
        )}
      />

      <motion.button
        type="button"
        whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
        onPointerDown={repeatStart(step)}
        onMouseDown={repeatStart(step)}
        onKeyDown={(e) => e.key === 'Enter' && changeBy(step)}
        onContextMenu={(e) => e.preventDefault()}
        disabled={plusDisabled}
        className={cn(
          'px-3 py-1 border rounded-md text-lg font-bold transition',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600',
          plusDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
        )}
        aria-label="Augmenter la quantité"
      >
        +
      </motion.button>
    </div>
  )
}
