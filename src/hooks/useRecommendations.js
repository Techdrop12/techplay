// src/hooks/useRecommendations.js
import { useState, useEffect, useRef } from 'react'

/**
 * Hook pour récupérer les recommandations produit.
 * @param {string} category - Catégorie produit pour filtrer.
 * @param {string[]} excludeIds - Liste des _id à exclure (ex: produits déjà en panier).
 * @param {number} limit - Nombre max de recommandations (défaut 4).
 * @returns {Object} { recommendations, loading, error }
 */
export function useRecommendations(category, excludeIds = [], limit = 4) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    if (!category) {
      setRecommendations([])
      setError('Catégorie manquante')
      setLoading(false)
      return
    }

    // Annule la requête précédente si existante
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.append('category', category)
    if (excludeIds.length > 0) {
      params.append('excludeIds', excludeIds.join(','))
    }
    params.append('limit', limit.toString())

    fetch(`/api/recommendations?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Erreur lors du chargement des recommandations')
        }
        return res.json()
      })
      .then(data => {
        setRecommendations(data)
        setError(null)
      })
      .catch(err => {
        if (err.name === 'AbortError') return // Requête annulée : pas d'erreur à traiter
        setError(err.message)
        setRecommendations([])
      })
      .finally(() => setLoading(false))

    // Nettoyage : annuler requête si composant démonté ou paramètres changent
    return () => {
      controller.abort()
    }
  }, [category, excludeIds.join(','), limit])

  return { recommendations, loading, error }
}
