'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function AdminReviewTable() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data)
    } catch (err) {
      toast.error("Erreur lors du chargement des avis")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet avis ?')) return

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Avis supprimé')
        setReviews(reviews.filter((r) => r._id !== id))
      } else {
        throw new Error()
      }
    } catch (err) {
      toast.error("Échec de la suppression")
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Gestion des avis clients</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Nom</th>
              <th className="text-left py-2">Note</th>
              <th className="text-left py-2">Commentaire</th>
              <th className="text-left py-2">Produit</th>
              <th className="text-left py-2">Date</th>
              <th className="text-center py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <motion.tr
                key={r._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="py-2 font-semibold">{r.name}</td>
                <td className="py-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i <= r.rating ? 'text-yellow-400' : 'text-gray-300'}
                      fill={i <= r.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </td>
                <td className="py-2 max-w-sm break-words">{r.comment}</td>
                <td className="py-2">{r.productId}</td>
                <td className="py-2 text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 text-center">
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Supprimer l’avis"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
