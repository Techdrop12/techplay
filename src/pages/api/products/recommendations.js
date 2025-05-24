import { useState, useEffect } from 'react'

/**
 * Hook pour récupérer les recommandations produit
 * @param {string} category - catégorie produit pour filtrer
 * @param {string[]} excludeIds - liste des _id à exclure (ex: produits déjà en panier)
 * @param {number} limit - nombre max de recommandations (défaut 4)
 * @returns {Object} { recommendations, loading, error }
 */
export function useRecommendations(category, excludeIds = [], limit = 4) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!category) {
      setRecommendations([])
      setError('Catégorie manquante')
      return
    }

    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.append('category', category)
    if (excludeIds.length > 0) params.append('excludeIds', excludeIds.join(','))
    params.append('limit', limit.toString())

    fetch(`/api/recommendations?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Erreur lors du chargement des recommandations')
        }
        return res.json()
      })
      .then(data => setRecommendations(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, excludeIds.join(','), limit])

  return { recommendations, loading, error }
}
