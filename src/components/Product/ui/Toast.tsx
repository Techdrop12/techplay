'use client'
import { Toaster } from 'react-hot-toast'

export default function Toast() {
  return <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
}
