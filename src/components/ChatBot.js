'use client'

import { useState } from 'react'

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = { from: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    })
    const data = await res.json()
    const botMsg = { from: 'bot', text: data.reply }
    setMessages(prev => [...prev, botMsg])
  }

  return (
    <div className="fixed bottom-4 right-4">
      {open ? (
        <div className="bg-white border shadow-xl w-72 rounded-xl p-3">
          <div className="text-sm font-bold mb-2">Assistant TechPlay</div>
          <div className="h-48 overflow-y-auto text-sm space-y-1 mb-2">
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'user' ? 'text-right text-blue-600' : 'text-left text-gray-700'}>
                {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Écris ta question..."
            className="border rounded px-2 py-1 w-full text-sm"
          />
          <button
            className="text-xs text-gray-500 mt-1"
            onClick={() => setOpen(false)}
          >Fermer</button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white rounded-full px-4 py-2 shadow-lg"
        >Chat</button>
      )}
    </div>
  )
}