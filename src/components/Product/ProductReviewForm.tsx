'use client';

import { useState } from 'react';

import RatingStars from '@/components/ui/RatingStars';

type Props = {
  productId: string;
};

export default function ProductReviewForm({ productId }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetMessages = () => {
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    const cleanComment = comment.trim();
    const cleanEmail = email.trim();

    if (!productId) {
      setError('Produit introuvable.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Veuillez sélectionner une note entre 1 et 5.');
      return;
    }

    if (cleanComment.length < 3) {
      setError('Votre avis doit contenir au moins 3 caractères.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: cleanComment,
          ...(cleanEmail ? { email: cleanEmail } : {}),
          hp: '',
        }),
      });

      const data: unknown = await res.json().catch(() => ({}));
      const payload =
        typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};

      if (!res.ok) {
        const message =
          typeof payload.error === 'string' ? payload.error : "Impossible d'envoyer votre avis.";
        throw new Error(message);
      }

      setSuccess(
        typeof payload.message === 'string'
          ? payload.message
          : 'Merci, votre avis a bien été envoyé.'
      );
      setRating(0);
      setComment('');
      setEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <h3 className="mb-2 font-semibold">Laisser un avis</h3>

      <div>
        <RatingStars value={rating} onChange={setRating} editable />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="review-hp">Ne pas remplir ce champ</label>
        <input id="review-hp" name="hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        className="w-full rounded border p-2"
        placeholder="Votre email (optionnel)"
        value={email}
        onChange={(e) => {
          resetMessages();
          setEmail(e.target.value);
        }}
      />

      <textarea
        className="w-full rounded border p-2"
        placeholder="Votre avis"
        value={comment}
        onChange={(e) => {
          resetMessages();
          setComment(e.target.value);
        }}
        rows={5}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600" role="status">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded bg-brand px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  );
}
