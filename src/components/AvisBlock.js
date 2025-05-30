'use client'

import { useEffect, useState } from 'react'
import ReactStars from 'react-rating-stars-component'

export default function AvisBlock({ slug }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    fetch(`/api/products/${slug}/review`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
  }, [slug])

  if (!reviews.length) return null

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Avis des clients</h2>
      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="border p-4 rounded-md bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <ReactStars
                count={5}
                value={r.rating}
                size={20}
                isHalf={true}
                edit={false}
                activeColor="#facc15"
              />
              <span className="text-sm font-semibold text-gray-700">{r.name}</span>
            </div>
            <p className="text-sm text-gray-700">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}