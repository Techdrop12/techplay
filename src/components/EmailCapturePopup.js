'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function EmailCapturePopup() {
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('user_email')
      const alreadyClosed = localStorage.getItem('email_popup_closed')

      if (!savedEmail && !alreadyClosed) {
        const timeout = setTimeout(() => setVisible(true), 15000)
        return () => clearTimeout(timeout)
      }
    }
  }, [])

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Adresse email invalide')
      return
    }

    try {
      const res = await fetch('/api/brevo/abandon-panier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        toast.success('Merci ! Vous recevrez nos offres par email.')
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_email', email)
        }
        setSubmitted(true)
        setTimeout(() => setVisible(false), 2000)
      } else {
        throw new Error()
      }
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleClose = () => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('email_popup_closed', 'true')
    }
  }

  if (!visible || submitted) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center">
        <h2 className="text-lg font-semibold mb-2">🎁 -10% sur votre 1ère commande</h2>
        <p className="text-sm mb-4">Recevez une réduction exclusive en vous inscrivant à notre newsletter !</p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Votre email"
          className="border w-full p-2 mb-3 rounded text-sm"
        />
        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded w-full text-sm"
        >
          Recevoir mon code
        </button>
        <button
          onClick={handleClose}
          className="mt-2 text-xs text-gray-500 underline"
        >
          Non merci
        </button>
      </div>
    </div>
  )
}
