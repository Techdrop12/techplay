'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ReactStars from 'react-rating-stars-component';

interface ReviewItem {
  rating: number;
  name?: string;
  comment?: string;
}

interface AvisBlockProps {
  slug: string;
}

export default function AvisBlock({ slug }: AvisBlockProps) {
  const t = useTranslations('avis');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/products/${slug}/review`)
      .then((res) => {
        if (!res.ok) throw new Error('Reviews fetch failed');
        return res.json();
      })
      .then((data: ReviewItem[]) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mt-10" role="region" aria-label={t('title')}>
        <h2 className="text-xl font-bold mb-4">{t('title')}</h2>
        <p className="text-sm text-token-text/60">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10" role="region" aria-label={t('title')}>
        <h2 className="text-xl font-bold mb-4">{t('title')}</h2>
        <p className="text-sm text-token-text/70" role="status">
          {t('error')}
        </p>
      </div>
    );
  }

  if (!reviews.length) return null;

  return (
    <div className="mt-10" role="region" aria-label={t('title')}>
      <h2 className="text-xl font-bold mb-4">{t('title')}</h2>
      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="border border-[hsl(var(--border))] p-4 rounded-xl bg-[hsl(var(--surface))]"
          >
            <div className="flex items-center gap-2 mb-1">
              <ReactStars
                count={5}
                value={r.rating}
                size={20}
                isHalf={true}
                edit={false}
                activeColor="#facc15"
              />
              <span className="text-sm font-semibold text-[hsl(var(--text))]">{r.name}</span>
            </div>
            <p className="text-sm text-token-text/85">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
