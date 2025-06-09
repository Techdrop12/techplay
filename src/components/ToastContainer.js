// src/components/ToastContainer.js
'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '0.5rem',
          padding: '12px 16px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#ecfdf5',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
      }}
    />
  )
}
