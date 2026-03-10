'use client'

import { motion } from 'framer-motion'
import { Star, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function AdminReviewTable() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadReviews = async () => {
      setLoading(true)

      try {
        const res = await fetch('/api/reviews')
        if (!res.ok) throw new Error('Erreur API')

        const data = await res.json()
        if (mounted) {
          setReviews(Array.isArray(data) ? data : [])
        }
      } catch {
        toast.error('Erreur lors du chargement des avis')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadReviews()

    return () => {
      mounted = false
    }
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('❌ Supprimer cet avis ?')) return

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Suppression impossible')

      toast.success('✅ Avis supprimé')
      setReviews((prev) => prev.filter((review) => review._id !== id))
    } catch {
      toast.error('Échec de la suppression')
    }
  }

  return (
    <div className="rounded shadow bg-white p-6 dark:bg-zinc-900">
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
        📝 Gestion des avis clients
      </h2>

      {loading ? (
        <p className="text-gray-500">Chargement des avis...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400">Aucun avis pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Note</th>
                <th className="px-4 py-2 text-left">Commentaire</th>
                <th className="px-4 py-2 text-left">Produit</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review) => (
                <motion.tr
                  key={review._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t transition hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <td className="px-4 py-2 font-medium">{review.name}</td>

                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                          fill={i <= review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="max-w-xs break-words px-4 py-2">{review.comment}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{review.productId}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}
                  </td>

                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(review._id)}
                      className="text-red-600 transition hover:text-red-800"
                      title="Supprimer l’avis"
                      aria-label="Supprimer l’avis"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}