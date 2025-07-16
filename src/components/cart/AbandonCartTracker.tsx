'use client'
import { useEffect } from 'react'
import { sendAbandonCartReminder } from '@/lib/abandon-cart'

export default function AbandonCartTracker({
  email,
  cart,
}: {
  email: string
  cart: any[]
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      sendAbandonCartReminder(email, cart)
    }, 90000) // 1m30 d’inactivité

    return () => clearTimeout(timer)
  }, [email, cart])

  return null
}
