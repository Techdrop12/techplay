'use client'

import { useState, useEffect, useRef } from 'react'

export default function LiveChat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: "Tu es l'assistant TechPlay, réponds simplement." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages([...newMessages, data.reply])
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Désolé, une erreur est survenue." }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border rounded shadow-lg flex flex-col">
      <div className="p-2 border-b font-bold text-center bg-black text-white">Chat TechPlay</div>
      <div className="flex-1 overflow-y-auto p-2 h-60 space-y-2">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <p className={`inline-block px-3 py-1 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') sendMessage() }}
          disabled={loading}
          placeholder="Pose ta question..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-black text-white px-3 rounded disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}
