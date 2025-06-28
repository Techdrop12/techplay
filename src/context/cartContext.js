'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // ✅ Chargement du panier au démarrage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      setCart([]);
    }
  }, []);

  // ✅ Sauvegarde du panier à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
      } catch (e) {
        console.warn('Erreur de sauvegarde du panier :', e);
      }
    }
  }, [cart]);

  // ✅ Ajouter un produit
  const addToCart = (product) => {
    setCart((curr) => {
      const exists = curr.find((item) => item._id === product._id);
      if (exists) {
        return curr.map((item) =>
          item._id === product._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...curr, { ...product, quantity: 1 }];
    });
  };

  // ✅ Supprimer un produit
  const removeFromCart = (productId) => {
    setCart((curr) => curr.filter((item) => item._id !== productId));
  };

  // ✅ Modifier la quantité
  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart((curr) =>
      curr.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // ✅ Vider le panier
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
