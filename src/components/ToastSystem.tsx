// src/components/ToastSystem.tsx
'use client'

import { Toaster, toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  type?: ToastType
  message: string
  duration?: number
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function showToast({
  type = 'info',
  message,
  duration = 4000,
  position = 'top-right',
}: ToastOptions) {
  const baseStyle = {
    borderRadius: '6px',
    padding: '12px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }

  const styles = {
    success: { background: '#10b981', color: '#fff' },
    error: { background: '#ef4444', color: '#fff' },
    info: { background: '#3b82f6', color: '#fff' },
    warning: { background: '#f59e0b', color: '#fff' },
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  toast(`${icons[type]} ${message}`, {
    duration,
    position,
    style: { ...baseStyle, ...styles[type] },
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  })
}

export function ToastSystem() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      }}
    />
  )
}
