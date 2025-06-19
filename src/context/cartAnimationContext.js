'use client';

import React, { createContext, useState, useContext, useCallback } from 'react';

const CartAnimationContext = createContext({
  animating: false,
  triggerCartAnimation: () => {},
});

export function CartAnimationProvider({ children }) {
  const [animating, setAnimating] = useState(false);

  const triggerCartAnimation = useCallback(() => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1000);
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
