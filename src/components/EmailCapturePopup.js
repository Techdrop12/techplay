// ✅ /src/components/EmailCapturePopup.js (popup email, bonus conversion, Brevo)
'use client';

import { useEffect, useState } from 'react';

export default function EmailCapturePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem('email_popup_shown');
    if (!shown) setTimeout(() => setVisible(true), 12000);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    if (!/\S+@\S+\.\S+/.test(email)) return alert('Email invalide');
    fetch('/api/brevo-track', { method: 'POST', body: JSON.stringify({ email }) });
    localStorage.setItem('email_popup_shown', '1');
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <form className="bg-white p-6 rounded shadow-lg w-96" onSubmit={handleSubmit}>
        <h2 className="font-bold text-lg mb-2">Recevez une offre exclusive</h2>
        <p className="mb-4 text-sm text-gray-500">
          Inscrivez-vous et recevez -10 % sur votre première commande !
        </p>
        <input
          name="email"
          type="email"
          required
          placeholder="Votre email"
          className="border rounded px-3 py-2 w-full mb-2"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Je m’inscris</button>
        <button type="button" onClick={() => setVisible(false)} className="text-xs text-gray-400 mt-2 w-full">Fermer</button>
      </form>
    </div>
  );
}
