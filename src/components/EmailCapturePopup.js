'use client'

import { useEffect, useState } from 'react'

export default function EmailCapturePopup() {
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email')
    if (!savedEmail) {
      const timeout = setTimeout(() => setVisible(true), 15000) // apparait après 15 secondes
      return () => clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async () => {
    if (email) {
      localStorage.setItem('user_email', email)
      setVisible(false)

      try {
        await fetch('/api/brevo-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            event: 'panier_abandonne',
          }),
        })
      } catch (error) {
        console.error('Erreur envoi Brevo:', error)
      }

      alert('Merci, nous vous enverrons une relance si nécessaire.')
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 bg-white border shadow-lg p-4 rounded-md z-50 max-w-sm">
      <p className="mb-2 font-semibold">
        Laissez votre email pour recevoir une relance si vous quittez sans commander :
      </p>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Votre email"
        className="border rounded px-2 py-1 w-full mb-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-1 rounded text-sm w-full"
      >
        Enregistrer
      </button>
    </div>
  )
}
