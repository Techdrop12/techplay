'use client'

import { useState } from 'react'
import SEOHead from '@/components/SEOHead'
import { useTranslations } from 'next-intl'

export default function Contact() {
  const t = useTranslations('contact')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('Tous les champs sont obligatoires')
      return
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    })

    if (!res.ok) {
      alert("Erreur lors de l'envoi du message.")
      return
    }

    alert('Message envoyé avec succès !')
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <>
      <SEOHead
        titleKey="seo.contact_title"
        descriptionKey="seo.contact_description"
      />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-4 py-2 w-full rounded"
            required
          />
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-2 w-full rounded"
            required
          />
          <textarea
            placeholder="Votre message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border px-4 py-2 w-full rounded"
            rows={5}
            required
          ></textarea>
          <button className="bg-black text-white px-6 py-2 rounded hover:opacity-90">
            Envoyer
          </button>
        </form>
      </div>
    </>
  )
}
