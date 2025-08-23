'use client'
import RatingStars from '@/components/RatingStars'
export default function ProductRatingStars({ rating }: { rating: number }) {
  return <RatingStars value={rating} editable={false} size={20} />
}
