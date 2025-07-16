'use client'
import ReactStars from 'react-rating-stars-component'

export default function RatingStars({
  value,
  onChange,
  editable = false,
}: {
  value: number
  onChange?: (newRating: number) => void
  editable?: boolean
}) {
  return (
    <ReactStars
      count={5}
      value={value}
      onChange={onChange}
      size={24}
      activeColor="#facc15"
      edit={editable}
      isHalf={true}
    />
  )
}
