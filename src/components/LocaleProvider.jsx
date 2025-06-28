// ✅ /src/components/LocaleProvider.jsx (provider i18n, bonus App Router)
'use client';

import { createContext, useContext } from 'react';

const LocaleContext = createContext('fr');

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ locale, children }) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
