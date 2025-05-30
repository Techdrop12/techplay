'use client'

import { useEffect, useState } from 'react'
import ReactStars from 'react-rating-stars-component'

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then(res => res.json())
      .then(setReviews)
      .catch(() => {})
  }, [productId])

  if (!reviews.length) return <p className="text-sm text-gray-500 mt-4">Aucun avis pour l’instant.</p>

  return (
    <div className="space-y-4 mt-4">
      {reviews.map((r, i) => (
        <div key={i} className="border p-3 rounded shadow-sm">
          <ReactStars
            count={5}
            value={r.rating}
            size={20}
            edit={false}
            isHalf={false}
            activeColor="#facc15"
          />
          <p className="text-sm mt-1">{r.comment}</p>
          {r.image && (
            <img
              src={r.image}
              alt="photo client"
              className="mt-2 w-24 h-24 object-cover rounded"
            />
          )}
        </div>
      ))}
    </div>
  )
}
