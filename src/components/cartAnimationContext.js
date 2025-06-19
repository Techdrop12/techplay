'use client';

import { createContext, useState, useCallback } from 'react';

export const CartAnimationContext = createContext({
  animateCart: false,
  triggerCartAnimation: () => {},
});

export function CartAnimationProvider({ children }) {
  const [animateCart, setAnimateCart] = useState(false);

  const triggerCartAnimation = useCallback(() => {
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 600);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ animateCart, triggerCartAnimation }}>
      {children}
    </CartAnimationContext.Provider>
  );
}
