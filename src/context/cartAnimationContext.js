// ✅ /src/context/cartAnimationContext.js (bonus : animation panier)
'use client';
import { createContext, useContext, useState } from 'react';

const CartAnimationContext = createContext();

export function CartAnimationProvider({ children }) {
  const [animate, setAnimate] = useState(false);

  const trigger = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1200);
  };

  return (
    <CartAnimationContext.Provider value={{ animate, trigger }}>
      {children}
    </CartAnimationContext.Provider>
  );
}

export const useCartAnimation = () => useContext(CartAnimationContext);
