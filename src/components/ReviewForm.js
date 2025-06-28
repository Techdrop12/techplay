// ✅ /src/components/ReviewForm.js (ajout d’avis, bonus UX, optimisé)
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ScoreStars from './ScoreStars';

export default function ReviewForm({ productId }) {
  const [note, setNote] = useState(5);
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!comment) return toast.error("Merci d'écrire un avis !");
    setPending(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, note, comment }),
    });
    setPending(false);
    if (res.ok) {
      toast.success('Avis envoyé ! Merci 🙂');
      setComment('');
      setNote(5);
    } else {
      toast.error('Erreur, réessayez.');
    }
  }

  return (
    <form onSubmit={submit} className="my-8 bg-gray-50 rounded p-4 shadow-sm">
      <label className="block mb-2 font-semibold">Votre note</label>
      <ScoreStars value={note} />
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={note}
        onChange={(e) => setNote(Number(e.target.value))}
        className="mb-3 w-full"
      />
      <label className="block mb-2 font-semibold">Votre avis</label>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        required
        rows={2}
        placeholder="Votre retour compte vraiment !"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded mt-2"
      >
        Envoyer mon avis
      </button>
    </form>
  );
}
