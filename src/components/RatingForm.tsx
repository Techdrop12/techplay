'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

export default function RatingForm() {
  const [rating, setRating] = useState(0)

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={24}
          className={i <= rating ? 'text-yellow-500' : 'text-token-text/30'}
          onClick={() => setRating(i)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </div>
  )
}
