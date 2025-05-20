'use client'

import { Toaster } from 'react-hot-toast'
import { CartProvider } from '../context/cartContext'

export default function ClientWrapper({ children }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="top-right" />
    </CartProvider>
  )
}
