// 📁 /context/cartContext.js
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p._id === product._id)
      if (existing) {
        return prev.map(p => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)
      } else {
        return [...prev, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p._id === product._id)
      if (!existing) return prev
      if (existing.quantity === 1) {
        return prev.filter(p => p._id !== product._id)
      } else {
        return prev.map(p => p._id === product._id ? { ...p, quantity: p.quantity - 1 } : p)
      }
    })
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
