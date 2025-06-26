// ✅ src/components/LocaleProvider.jsx

'use client';

import { createContext, useContext } from 'react';
import { useLocale } from 'next-intl';

const LocaleContext = createContext('fr');
export function useLocaleContext() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }) {
  const locale = useLocale();
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
}
