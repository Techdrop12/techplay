'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import type { Review } from '@/types/product';

import { timeAgo } from '@/lib/formatDate';

/** Review avec champs optionnels API (helpful, verified) */
type ReviewWithExtras = Review & { helpful?: number; verified?: boolean };

function Skeleton() {
  return (
    <ul role="list" aria-label="Chargement des avis" className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <li key={i} className="p-4 bg-[hsl(var(--surface-2))] rounded-xl h-24" />
      ))}
    </ul>
  );
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const t = useTranslations('reviews');
  const [reviews, setReviews] = useState<ReviewWithExtras[]>([]);
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => {
    setError(null);
    setRetryCount((c) => c + 1);
  };

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetch(`/api/reviews/product/${productId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur réseau');
        return res.json();
      })
      .then((data: Review[]) => {
        const sorted = data.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
        setReviews(sorted);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(t('error_loading'));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [productId, t, retryCount]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => (filter ? r.rating === filter : true))
      .sort((a, b) => {
        if (sort === 'helpful') return (b.helpful ?? 0) - (a.helpful ?? 0);
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      });
  }, [reviews, filter, sort]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="text-sm text-red-600 mt-4 text-center" role="alert">
        {error}{' '}
        <button
          type="button"
          onClick={retry}
          className="underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--accent))] rounded"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-token-text/60 mt-4 text-center" aria-live="polite">
        {t('no_reviews')}
      </p>
    );
  }

  return (
    <section className="mt-8" aria-label={t('aria_label')}>
      <h3 className="text-lg font-semibold mb-4 text-center">{t('title')}</h3>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex space-x-1" role="group" aria-label={t('filter_label')}>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s === filter ? null : s)}
              className={`text-xs px-2 py-1 rounded border transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black ${
                s === filter ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))]' : 'text-token-text/80 hover:bg-[hsl(var(--surface-2))]'
              }`}
              aria-pressed={s === filter}
              aria-label={t('filter_stars', { count: s })}
            >
              {s}★
            </button>
          ))}
          {filter !== null && (
            <button
              onClick={() => setFilter(null)}
              className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] text-token-text/70 hover:bg-[hsl(var(--surface-2))] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[hsl(var(--accent))]"
              aria-label={t('clear_filter')}
            >
              {t('clear')}
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black"
          aria-label={t('sort_label')}
        >
          <option value="recent">📅 {t('sort_recent')}</option>
          <option value="helpful">👍 {t('sort_helpful')}</option>
        </select>
      </div>

      <ul className="space-y-4" role="list">
        {filteredReviews.map((r, i) => (
          <motion.li
            key={r._id || String(i)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 bg-white border rounded shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((j) => (
                <Star
                  key={j}
                  size={16}
                  className={j <= r.rating ? 'text-yellow-400' : 'text-token-text/30'}
                  fill={j <= r.rating ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              ))}
              <span className="text-xs text-token-text/60 ml-auto">
                {r.createdAt ? timeAgo(r.createdAt, 'fr') : '—'}
              </span>
            </div>

            <p className="text-sm text-token-text/90">{r.comment}</p>

            {Boolean(r.verified) && (
              <p className="text-xs text-green-600 mt-1 font-medium" aria-label={t('verified')}>
                ✔️ {t('verified')}
              </p>
            )}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
