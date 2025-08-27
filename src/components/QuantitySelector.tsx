'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type WheelEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value?: number
  defaultValue?: number
  onChange?: (val: number) => void
  onCommit?: (val: number) => void
  min?: number
  max?: number
  step?: number
  snapToStep?: boolean
  className?: string
  id?: string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  'aria-describedby'?: string
  fastMultiplier?: number
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const alignToStep = (n: number, min: number, step: number) => min + Math.round((n - min) / step) * step

export default function QuantitySelector({
  value,
  defaultValue,
  onChange,
  onCommit,
  min = 1,
  max = 99,
  step = 1,
  snapToStep = true,
  className,
  id,
  name,
  disabled = false,
  readOnly = false,
  'aria-describedby': ariaDescribedBy,
  fastMultiplier = 10,
}: QuantitySelectorProps) {
  const prefersReducedMotion = useReducedMotion()
  const isControlled = typeof value === 'number'

  const [internal, setInternal] = useState<number>(() => {
    const base = typeof defaultValue === 'number' ? defaultValue : typeof value === 'number' ? value : min
    const aligned = snapToStep ? alignToStep(base, min, step) : base
    return clamp(aligned, min, max)
  })

  const qty = isControlled ? clamp(snapToStep ? alignToStep(value!, min, step) : value!, min, max) : internal

  useEffect(() => {
    if (!isControlled) {
      setInternal((v) => clamp(snapToStep ? alignToStep(v, min, step) : v, min, max))
    }
  }, [min, max, step, snapToStep, isControlled])

  useEffect(() => {
    if (isControlled) setInternal(qty)
  }, [value, qty, isControlled])

  const emit = useCallback(
    (n: number, commit = false) => {
      const base = snapToStep ? alignToStep(n, min, step) : n
      const next = clamp(base, min, max)
      if (!isControlled) setInternal(next)
      onChange?.(next)
      if (commit) onCommit?.(next)
    },
    [isControlled, min, max, step, snapToStep, onChange, onCommit]
  )

  const changeBy = useCallback((delta: number) => emit((qty ?? min) + delta), [emit, qty, min])

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const repeatStop = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
    if (pressInterval.current) clearInterval(pressInterval.current)
    pressTimer.current = null
    pressInterval.current = null
  }
  useEffect(() => repeatStop, [])

  const repeatStart =
    (delta: number) =>
    (e: ReactMouseEvent | ReactPointerEvent): void => {
      e.preventDefault()
      if (disabled || readOnly) return
      changeBy(delta)
      repeatStop()
      let speed = 120
      let count = 0
      pressTimer.current = setTimeout(() => {
        pressInterval.current = setInterval(() => {
          changeBy(delta)
          count++
          if (count % 6 === 0) speed = Math.max(40, speed - 10)
        }, speed)
      }, 350)

      const once = { once: true } as AddEventListenerOptions
      window.addEventListener('pointerup', repeatStop, once)
      window.addEventListener('mouseup', repeatStop, once)
      window.addEventListener('touchend', repeatStop, once)
      window.addEventListener('pointercancel', repeatStop, once)
      window.addEventListener(
        'visibilitychange',
        () => {
          if (document.visibilityState !== 'visible') repeatStop()
        },
        once
      )
    }

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim()
    if (raw === '') {
      if (!isControlled) setInternal(min)
      return
    }
    const n = Number(raw)
    if (Number.isNaN(n)) return
    emit(n)
  }

  const onInputBlur = () => emit(qty, true)

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const fast = e.shiftKey ? fastMultiplier : 1
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      changeBy(step * fast)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      changeBy(-step * fast)
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      changeBy(step * fastMultiplier)
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      changeBy(-step * fastMultiplier)
    } else if (e.key === 'Home') {
      e.preventDefault()
      emit(min)
    } else if (e.key === 'End') {
      e.preventDefault()
      emit(max)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      emit(qty, true)
    }
  }

  const onWheel = (e: WheelEvent<HTMLInputElement>) => {
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
        key={qty}
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
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={qty}
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
