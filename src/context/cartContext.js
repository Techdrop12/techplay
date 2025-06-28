// ✅ /src/context/cartContext.js (gestion panier full option, stockage localStorage + bonus event)
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      if (stored) setCart(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
    }
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((x) => x._id === item._id);
      if (exists) {
        return prev.map((x) =>
          x._id === item._id
            ? { ...x, quantity: (x.quantity || 1) + 1 }
            : x
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x._id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
