// ✅ src/components/ChatBot.js

'use client';

import { useState } from 'react';

export default function ChatBot() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, history }),
    });
    const data = await res.json();
    setHistory([...history, { role: 'user', content: input }, { role: 'bot', content: data.reply }]);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 w-72 bg-white shadow-lg rounded-lg p-4 z-50 border">
      <div className="h-40 overflow-y-auto mb-2 text-xs">
        {history.length === 0 && <div className="text-gray-400">Pose-moi une question sur nos produits ou commandes !</div>}
        {history.map((msg, i) => (
          <div key={i} className={msg.role === 'bot' ? 'text-blue-700 my-1' : 'text-gray-800 my-1'}>
            <span className="font-bold">{msg.role === 'bot' ? 'Bot:' : 'Vous:'}</span> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 border rounded-l px-2 py-1"
          placeholder="Votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded-r"
        >
          {loading ? '...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
