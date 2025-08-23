// Ancien composant (react-icons) → lecture seule sur le nouveau
'use client'
import RatingStars from '../../components/RatingStars'

export default function StarRating({ rating, maxStars = 5, className = '' }: { rating: number; maxStars?: number; className?: string }) {
  return <RatingStars value={rating} max={maxStars} editable={false} className={className} />
}
