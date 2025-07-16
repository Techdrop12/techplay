'use client'
import { useEffect, useState } from 'react'

export default function PopupEmailCapture() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 15000)
    return () => clearTimeout(timeout)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded max-w-sm text-center space-y-3">
        <h3 className="text-xl font-bold">Restez informé</h3>
        <input
          type="email"
          required
          className="w-full border rounded px-3 py-2"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-brand text-white px-4 py-2 rounded" type="submit">
          S'inscrire
        </button>
      </form>
    </div>
  )
}
