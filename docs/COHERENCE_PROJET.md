# Cohérence du projet TechPlay

Vérification globale des dossiers et fichiers (structure, imports, i18n, config).

---

## 1. Structure et config

| Élément                 | Statut                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **tsconfig.json**       | `baseUrl: "."`, `paths: { "@/*": ["src/*"] }` — tous les imports `@/` résolvent vers `src/`                                                     |
| **next.config.mjs**     | Plugin next-intl pointe vers `./src/i18n/config.ts`                                                                                             |
| **next-intl.config.js** | `locales: ['fr', 'en']`, `defaultLocale: 'fr'`, aligné avec `src/lib/language.ts`                                                               |
| **tailwind.config.ts**  | `content: ['./src/**/*.{js,ts,jsx,tsx,mdx}']` — couvre tout le code source                                                                      |
| **i18n**                | `src/i18n/config.ts` utilise `LOCALE_COOKIE` et `loadMessages` ; `src/lib/language.ts` = source de vérité pour `Locale`, `DEFAULT_LOCALE`, etc. |

---

## 2. Imports et alias

- **TypeScript** : `npm run typecheck` — OK (tous les chemins résolvent).
- **ESLint** : `npm run lint` — OK.
- **Convention** : tout le code utilise l’alias `@/` (aucun import relatif `../` vers d’autres modules métier).
- **Locale** : une seule source pour le type `Locale` — `@/lib/language`. `src/lib/toLocale.ts` a été aligné pour importer depuis `@/lib/language` au lieu de `@/i18n/config`.

---

## 3. i18n (messages)

- **Clés racine** : `en.json` et `fr.json` ont les **mêmes 67 clés** (structure identique).
- **Chargement** : `src/i18n/loadMessages.ts` charge `@/messages/en.json` ou `fr.json` selon la locale, avec fallback sur `fr` en cas d’erreur.

---

## 4. Composants et réexports

- **Modal** : défini dans `src/components/Modal.tsx`, réexporté par `src/components/ui/Modal.tsx` — cohérent.
- **Cart** : `CartPageClient`, `CartPageFallback`, `EmptyCart`, `CartList`, `CartSummary`, `CartItem`, `CartReminder`, `AbandonCartTracker` — tous utilisés et référencés correctement.
- **SectionHeader** vs **SectionTitle** :
  - `SectionHeader` (kicker, title, sub) : utilisé sur la homepage, sections produits/packs/blog/FAQ.
  - `SectionTitle` (title, subtitle, className) : utilisé sur `products/packs` uniquement.
  - `components/ui/SectionTitle.tsx` (children) : **non utilisé** ailleurs — possible code mort si besoin de nettoyer.

---

## 5. Pages et routes

- **Avec locale** (`[locale]`) : `/`, `/en`, `/products`, `/search`, `/wishlist` — préfixe `/en` pour l’anglais, pas de préfixe pour le français (redirect `/` → `/fr` dans next.config).
- **Sans locale** : `/blog`, `/contact`, `/cart`, `/commande`, `/login`, etc. — locale par cookie + Accept-Language.
- **API** : routes sous `src/app/api/` — cohérentes avec les pages (admin, blog, contact, checkout, etc.).

---

## 6. Lib et types

- **Images produit** : logique centralisée dans `src/lib/productImage.ts` (`getProductImage`, `getProductSecondImage`), utilisée par `ProductCard` et réutilisable ailleurs.
- **Langue** : `src/lib/language.ts` — constantes et helpers partagés ; `src/lib/i18n-routing.tsx` — routage (localizePath, getCurrentLocale) basé sur `language.ts`.

---

## 7. Corrections appliquées lors de la vérification

1. **`src/lib/toLocale.ts`** : import du type `Locale` depuis `@/lib/language` au lieu de `@/i18n/config` pour une seule source de vérité.

---

## 8. Résumé

- **Structure** : cohérente (app, components, lib, messages, i18n, types, hooks, context).
- **Config** : Next, next-intl, Tailwind, TypeScript alignés.
- **i18n** : clés FR/EN identiques ; chargement et langue centralisés.
- **Imports** : 100 % en `@/`, typecheck et lint OK.
- **Optionnel** : supprimer ou réutiliser `components/ui/SectionTitle.tsx` (children) s’il reste inutilisé.
