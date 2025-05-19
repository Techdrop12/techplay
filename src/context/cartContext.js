'use client'
import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id)
      if (existing) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id)
      if (existing.quantity === 1) {
        return prevCart.filter((item) => item._id !== product._id)
      }
      return prevCart.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity - 1 } : item
      )
    })
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
