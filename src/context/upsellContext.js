// ✅ /src/context/upsellContext.js (bonus : suggestion produit/cross-sell)
'use client';
import { createContext, useContext, useState } from 'react';

const UpsellContext = createContext();

export function UpsellProvider({ children }) {
  const [upsell, setUpsell] = useState([]);

  const addUpsell = (product) => {
    setUpsell((prev) => [...prev, product]);
  };

  const clearUpsell = () => setUpsell([]);

  return (
    <UpsellContext.Provider value={{ upsell, addUpsell, clearUpsell }}>
      {children}
    </UpsellContext.Provider>
  );
}

export const useUpsell = () => useContext(UpsellContext);
