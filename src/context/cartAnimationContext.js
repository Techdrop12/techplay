'use client';

import { createContext, useContext, useState, useCallback } from 'react';

// Contexte pour déclencher une animation (rebond, surbrillance, etc.) du panier
export const CartAnimationContext = createContext({
  animating: false,
  triggerCartAnimation: () => {},
});

export function CartAnimationProvider({ children }) {
  const [animating, setAnimating] = useState(false);

  const triggerCartAnimation = useCallback(() => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1000); // durée de l'animation
  }, []);

  return (
    <CartAnimationContext.Provider value={{ animating, triggerCartAnimation }}>
      {children}
    </CartAnimationContext.Provider>
  );
}

export function useCartAnimation() {
  return useContext(CartAnimationContext);
}
