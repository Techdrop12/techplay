'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(timeout);
  }, []);

  const submit = async () => {
    if (!email) return;
    try {
      const res = await fetch('/api/emails/capture', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        toast.success('Merci !');
        setVisible(false);
      } else {
        toast.error('Erreur');
      }
    } catch {
      toast.error('Erreur');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 border p-4 rounded shadow-md max-w-sm space-y-2">
      <p>💌 Recevez nos nouveautés en avant-première</p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email"
        className="w-full border px-2 py-1 rounded"
      />
      <button
        onClick={submit}
        className="bg-blue-600 text-white w-full py-1 rounded hover:bg-blue-700"
      >
        S’inscrire
      </button>
    </div>
  );
}
