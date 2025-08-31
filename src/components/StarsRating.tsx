'use client'
import RatingStars from '@/components/RatingStars'

export default function StarsRating({
  rating,
  outOf = 5,
  size = 18,
  showValue = true,
}: { rating: number; outOf?: number; size?: number; showValue?: boolean }) {
  return <RatingStars value={rating} max={outOf} editable={false} size={size} showValue={showValue} />
}
