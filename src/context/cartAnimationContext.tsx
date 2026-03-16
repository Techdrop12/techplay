'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface CartAnimationContextValue {
  animating: boolean;
  triggerCartAnimation: () => void;
}

export const CartAnimationContext = createContext<CartAnimationContextValue>({
  animating: false,
  triggerCartAnimation: () => {},
});

interface CartAnimationProviderProps {
  children: ReactNode;
}

export function CartAnimationProvider({ children }: CartAnimationProviderProps) {
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

export function useCartAnimation(): CartAnimationContextValue {
  return useContext(CartAnimationContext);
}
