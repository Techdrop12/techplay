import type { Review } from '@/types/product';

import RatingStars from '@/components/RatingStars';
import { formatDate } from '@/lib/formatDate';

interface Props {
  reviews: Review[];
}

function toValidDate(value: string | number | Date | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function ProductReviews({ reviews }: Props) {
  const list = Array.isArray(reviews) ? reviews : [];

  return (
    <section className="mt-8" aria-labelledby="product-reviews-title">
      <h3 id="product-reviews-title" className="mb-4 text-lg font-semibold">
        Avis clients
      </h3>

      {list.length === 0 ? (
        <p className="text-sm text-token-text/70">Aucun avis pour ce produit.</p>
      ) : (
        <div className="space-y-4">
          {list.map((review, index) => {
            const createdDate = toValidDate(review.createdAt);
            const createdLabel = createdDate ? formatDate(createdDate) : null;
            const author = review.author?.trim() || 'Client';
            const title = review.title?.trim();
            const comment = review.comment?.trim() || 'Aucun commentaire.';
            const key = review._id || `${author}-${review.rating}-${index}`;

            return (
              <article
                key={key}
                className="border-b pb-3 last:border-b-0"
                aria-label={`Avis de ${author}`}
              >
                <header className="mb-1 flex items-center gap-2">
                  <RatingStars
                    value={review.rating}
                    editable={false}
                    size={16}
                    ariaLabel={`Note ${review.rating}/5`}
                  />

                  <span className="text-sm text-zinc-600 dark:text-zinc-400">par {author}</span>

                  {createdLabel && (
                    <time
                      className="ml-auto text-xs text-zinc-500 dark:text-zinc-400"
                      dateTime={createdDate?.toISOString()}
                    >
                      {createdLabel}
                    </time>
                  )}
                </header>

                {title && <h4 className="font-medium">{title}</h4>}

                <p className="whitespace-pre-line text-sm text-token-text/85">{comment}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
