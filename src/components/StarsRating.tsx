'use client'
import RatingStars from './RatingStars'

export default function StarsRating({
  rating,
  outOf = 5,
  size = 18,
  showValue = true,
}: { rating: number; outOf?: number; size?: number; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Note : ${rating} sur ${outOf}`}>
      <RatingStars value={rating} max={outOf} editable={false} size={size} />
      {showValue && (
        <span className="ml-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}
