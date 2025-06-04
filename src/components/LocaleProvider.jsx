// src/components/LocaleProvider.jsx
'use client';

export default function LocaleProvider({ locale, children }) {
  // Ici on pourrait stocker la locale dans un contexte React au besoin.
  // Pour l'instant, on se contente de renvoyer les enfants.
  return <>{children}</>;
}
