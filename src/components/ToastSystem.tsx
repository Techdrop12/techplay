'use client';

import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { ReactElement } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  type?: ToastType;
  message: string;
  duration?: number;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

const baseStyle = {
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: '0.875rem',
  fontWeight: 500,
  boxShadow: 'var(--shadow-md)',
} as const;

const styles: Record<ToastType, { background: string; color: string }> = {
  success: { background: 'hsl(var(--success))', color: '#fff' },
  error: { background: 'hsl(var(--danger))', color: '#fff' },
  info: { background: 'hsl(var(--accent))', color: '#fff' },
  warning: { background: 'hsl(var(--warning))', color: '#fff' },
};

const iconComponents: Record<ToastType, ReactElement> = {
  success: <CheckCircle2 size={18} aria-hidden className="shrink-0" />,
  error: <AlertCircle size={18} aria-hidden className="shrink-0" />,
  info: <Info size={18} aria-hidden className="shrink-0" />,
  warning: <AlertTriangle size={18} aria-hidden className="shrink-0" />,
};

export function showToast({
  type = 'info',
  message,
  duration = 4000,
  position = 'top-right',
}: ToastOptions) {
  toast(message, {
    duration,
    position,
    icon: iconComponents[type],
    style: { ...baseStyle, ...styles[type] },
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
}

export function ToastSystem() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'var(--shadow-md)',
        },
      }}
    />
  );
}
