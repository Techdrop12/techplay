'use client'
import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    const exists = cart.find(item => item._id === product._id)
    if (exists) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (product) => {
    const existing = cart.find(item => item._id === product._id)
    if (existing.quantity === 1) {
      setCart(cart.filter(item => item._id !== product._id))
    } else {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity - 1 } : item))
    }
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
