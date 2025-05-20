'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function EmailPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('popupShown')
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    localStorage.setItem('popupShown', 'true')

    // Optionnel : envoyer l’email à un outil comme MailerSend, Sendinblue, etc.
    console.log('Email enregistré :', email)
  }

  if (!show || submitted) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-2">🎁 -10% aujourd’hui !</h2>
        <p className="mb-4 text-sm">Laissez votre email pour recevoir le code promo TECH10.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded"
          >
            Recevoir le code
          </button>
        </form>
      </div>
    </motion.div>
  )
}
