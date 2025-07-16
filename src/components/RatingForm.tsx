'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export default function RatingForm() {
  const [rating, setRating] = useState(0)

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={24}
          className={i <= rating ? 'text-yellow-500' : 'text-gray-300'}
          onClick={() => setRating(i)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  )
}
