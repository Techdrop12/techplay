'use client'

import { motion } from 'framer-motion'
import { Bot, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ProductAssistant({ product }) {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const askAI = async () => {
    if (!question.trim()) return

    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: JSON.stringify({
            title: product?.title,
            description: product?.description,
            price: product?.price,
            category: product?.category,
          }),
        }),
      })

      const data = await res.json()
      if (!data?.reply) throw new Error('Réponse vide')

      setResponse(data.reply)
    } catch {
      toast.error("Erreur lors de la réponse de l'assistant")
      setResponse("Désolé, une erreur s’est produite.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 rounded border bg-gray-50 p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
        <Bot size={18} /> Besoin d’un conseil instantané ?
      </h3>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void askAI()
            }
          }}
          placeholder="Posez une question sur ce produit..."
          className="flex-1 rounded border px-3 py-2 text-sm"
          aria-label="Question produit"
        />

        <button
          type="button"
          onClick={() => void askAI()}
          className="flex items-center justify-center gap-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Réponse...' : 'Demander'}
        </button>
      </div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded border bg-white p-3 text-sm shadow-inner"
          role="status"
          aria-live="polite"
        >
          {response}
        </motion.div>
      )}
    </div>
  )
}