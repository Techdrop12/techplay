'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

function timeAgo(date) {
  const d = new Date(date)
  const diff = Math.floor((new Date() - d) / 1000)
  if (diff < 60) return 'à l’instant'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  return `${Math.floor(diff / 86400)} j`
}

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState(null) // null, 5, 4, ...
  const [sort, setSort] = useState('recent') // 'recent' ou 'helpful'

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setReviews(sorted)
      })
      .catch(() => {})
  }, [productId])

  const filteredReviews = reviews
    .filter((r) => (filter ? r.rating === filter : true))
    .sort((a, b) => {
      if (sort === 'helpful') return (b.helpful || 0) - (a.helpful || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-500 mt-4" aria-live="polite">
        Aucun avis pour ce produit.
      </p>
    )
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-center">Avis des clients</h3>

      {/* Filtres & tri */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex space-x-1">
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s === filter ? null : s)}
              className={`text-xs px-2 py-1 rounded border transition ${
                s === filter ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={`Filtrer par ${s} étoiles`}
            >
              {s}★
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="recent">📅 Récents</option>
          <option value="helpful">👍 Utiles</option>
        </select>
      </div>

      {/* Liste des avis */}
      <ul className="space-y-4">
        {filteredReviews.map((r, i) => (
          <motion.li
            key={r._id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="p-4 bg-white border rounded shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((j) => (
                <Star
                  key={j}
                  size={16}
                  className={j <= r.rating ? 'text-yellow-400' : 'text-gray-300'}
                  fill={j <= r.rating ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
              ))}
              <span className="text-xs text-gray-500 ml-auto">{timeAgo(r.createdAt)}</span>
            </div>

            <p className="text-sm text-gray-800">{r.comment}</p>

            {r.verified && (
              <p className="text-xs text-green-600 mt-1 font-medium">✔️ Avis vérifié</p>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
