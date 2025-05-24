'use client'

import { useState } from 'react'

export default function ChatBot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return
    setMessages([...messages, { sender: 'user', text: input }])
    setInput('')

    // Envoi au backend IA (ex: /api/ai/chat)
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    })

    const data = await res.json()
    if (data.reply) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: data.reply }])
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow rounded p-4 flex flex-col">
      <div className="flex-grow overflow-auto mb-2 max-h-64">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-1 p-2 rounded ${
              msg.sender === 'user' ? 'bg-gray-200 self-end' : 'bg-blue-200 self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        className="border p-2 rounded mb-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        placeholder="Pose ta question..."
      />
      <button
        className="bg-black text-white py-2 rounded"
        onClick={sendMessage}
      >
        Envoyer
      </button>
    </div>
  )
}
