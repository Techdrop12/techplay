'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useCart } from './cartContext'

const UpsellContext = createContext()

export const UpsellProvider = ({ children }) => {
  const { cart } = useCart()
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cart.length) {
      setRecommended([])
      return
    }

    const controller = new AbortController()

    const fetchRecommendations = async () => {
      setLoading(true)
      setError(null)
      try {
        const categories = [...new Set(cart.map(p => p.category))]
        const excludeIds = cart.map(p => p._id).join(',')
        const res = await fetch(`/api/recommendations?categories=${categories.join(',')}&excludeIds=${excludeIds}&limit=8`, {
          signal: controller.signal
        })

        if (!res.ok) throw new Error('Erreur chargement recommandations')

        const data = await res.json()
        setRecommended(data)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
    return () => controller.abort()
  }, [cart])

  return (
    <UpsellContext.Provider value={{ recommended, loading, error }}>
      {children}
    </UpsellContext.Provider>
  )
}

export const useUpsell = () => useContext(UpsellContext)
