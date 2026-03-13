// ✅ src/components/FeedbackButton.js

'use client';

import { useState } from 'react';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSend() {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });
    setSent(true);
    setTimeout(() => setOpen(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-8 bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg z-40"
      >
        💬 Feedback
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg border">
            <h2 className="font-bold mb-2">Donnez-nous votre avis !</h2>
            {sent ? (
              <div className="text-green-700">Merci pour votre retour 🙏</div>
            ) : (
              <>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={3}
                  placeholder="Votre retour, une idée, un bug…"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Envoyer
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-3 text-gray-600"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
