'use client'
import RatingStars from './RatingStars'
export default function ScoreStars({ value = 0, max = 5 }: { value?: number; max?: number }) {
  return <RatingStars value={value} max={max} editable={false} />
}
