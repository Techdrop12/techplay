// src/components/Product/ProductReviews.tsx
import RatingStars from '@/components/RatingStars'
import type { Review } from '@/types/product'
import { formatDate } from '@/lib/formatDate'

interface Props {
  reviews: Review[]
}

export default function ProductReviews({ reviews }: Props) {
  const list = Array.isArray(reviews) ? reviews : []

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-lg mb-4">Avis clients</h3>

      {list.length === 0 && <p>Aucun avis pour ce produit.</p>}

      {list.map((review) => {
        const created =
          typeof review.createdAt === 'string' || review.createdAt instanceof Date
            ? formatDate(new Date(review.createdAt as any))
            : undefined

        return (
          <article key={review._id} className="mb-4 border-b pb-3">
            <header className="flex items-center gap-2 mb-1">
              <RatingStars
                value={review.rating}
                editable={false}
                size={16}
                ariaLabel={`Note ${review.rating}/5`}
              />
              {review.author && <span className="text-sm text-zinc-600">par {review.author}</span>}
              {created && <time className="ml-auto text-xs text-zinc-500">{created}</time>}
            </header>
            {review.title && <h4 className="font-medium">{review.title}</h4>}
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{review.comment}</p>
          </article>
        )
      })}
    </div>
  )
}
