'use client'
import RatingStars from '@/components/RatingStars'

export default function StarRating({
  rating,
  maxStars = 5,
  className = '',
  size,
}: { rating: number; maxStars?: number; className?: string; size?: number }) {
  return (
    <RatingStars value={rating} max={maxStars} editable={false} className={className} size={size ?? 20} />
  )
}
