'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {
          setCart([]);
        }
      }
    }
  }, []);

  // Synchroniser localStorage à chaque changement de panier
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((curr) => {
      const exists = curr.find((item) => item._id === product._id);
      if (exists) {
        return curr.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...curr, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((curr) => curr.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart((curr) =>
      curr.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
