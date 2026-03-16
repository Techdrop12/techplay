# TechPlay – Audit d’améliorations (vérification en profondeur)

> Généré à partir d’un audit complet du projet. À traiter par priorité.

---

## Suite des améliorations (récentes)

- **i18n** : `common.reset_filters` et `common.reset_zoom` utilisés dans ProductCatalogue, PacksSection, FilterPanel, ProductFilter, BestProducts, categorie/[category], blog (page + [slug]), ProductGallery. HeroSection et HeroBanner utilisent le namespace `hero` (title, subtitle, banner\_\*). ProductSkeleton utilise `skeleton.loading_product`.
- **Résilience** : `error.tsx` ajoutés pour les segments `products` et `blog`.
- **Accessibilité** : champ newsletter Footer avec `aria-describedby` sur l'input en cas d'erreur.
- **Performance** : HeroSection avec `sizes` responsive ; ESLint `react-hooks/exhaustive-deps` passé en `warn`.
- **Suite (not-found, SEO, admin, i18n)** : Metadata not-found via `generateMetadata` + `getTranslations('seo_extra')`. Produit introuvable (products/[slug]) et pack introuvable (packs/[slug]) utilisent `seo` / `seo_extra` pour titre et description. Error boundary `admin/error.tsx` ajouté. i18n : FeedbackButton (namespace `feedback`), AIProductSummary (namespace `product`, clés `ai_summary_*`), AdminStatsBlock (`admin.loading_stats`). Clés `seo_extra` pour pack_not_found et not_found_page.
- **Premium / full-option** : `loading.tsx` pour mentions-legales, confidentialite, cgv. Page commande/success entièrement i18n (`success_page` + `generateMetadata` via `seo`). Admin : AdminBlogTable, AdminReviewTable, EditProductForm en i18n (namespace `admin` étendu). Error boundary `categorie/error.tsx`. Skeleton d’accueil : `LoadingSectionSkeleton` (i18n) pour les dynamic imports BestProducts, PacksSection, FAQ. EditProductForm : champs avec bordures/thème et focus-visible, bouton Enregistrer via `common.save` / `common.saving`.

---

## Résumé exécutif

- **Points forts** : structure Next.js 16, headers de sécurité, rate limiting sur plusieurs APIs, bases i18n/SEO, safe-area et touch targets déjà améliorés.
- **Priorités recommandées** : sécurité (API facture, admin token), accessibilité (focus trap SlideOverPanel), i18n (chaînes en dur), résilience (error boundaries, retry), puis tests et config.

---

## 1. Qualité de code et cohérence

| Fichier                                  | Problème                                                              | Piste d’amélioration                                                    |
| ---------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/account/page.tsx`               | Texte en dur FR : "Mon compte", "Espace client", "Se connecter", etc. | Déplacer dans `messages/fr.json` + `useTranslations`.                   |
| `src/app/account/mes-commandes/page.tsx` | Texte en dur : "Mes commandes", "Connectez-vous…", "← Espace client". | Utiliser les clés i18n.                                                 |
| `src/app/commande/page.tsx` (l.225)      | Formatage devise avec `Intl.NumberFormat` au lieu du helper commun.   | Utiliser `formatPrice(subtotal, { currency })` depuis `@/lib/utils`.    |
| `src/lib/logger.ts`                      | `console.log` / `console.warn` selon `isDev`.                         | S’appuyer sur `removeConsole` dans next.config ou logger no-op en prod. |
| `src/components/ui/HeroSection.tsx`      | "Bienvenue sur TechPlay" en dur.                                      | Clé de traduction (ex. `seo.homepage_title` ou clé hero dédiée).        |
| `src/components/HeroBanner.tsx`          | "Bienvenue chez TechPlay" en dur.                                     | i18n.                                                                   |
| `src/app/admin/produit/[id]/page.tsx`    | "Modifier le produit ID : {id}" en dur.                               | Clé de traduction.                                                      |
| `eslint.config.cjs`                      | `react-hooks/exhaustive-deps` désactivé.                              | Passer à `warn` pour détecter les deps manquantes.                      |
| `eslint.config.cjs`                      | `@typescript-eslint/no-explicit-any` en `warn`.                       | Envisager `error` pour un typage plus strict.                           |
| `tsconfig.json`                          | `noUncheckedIndexedAccess` absent.                                    | Activer pour un accès aux index plus sûr.                               |

---

## 2. Performance

| Fichier                                                         | Problème                                           | Piste d’amélioration                                                   |
| --------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/components/ChatBot.tsx`                                    | Composant lourd, pas en dynamic import.            | Lazy-load avec `next/dynamic` et `ssr: false` où il est rendu.         |
| `src/components/ProductAssistant.tsx`                           | Idem.                                              | Dynamic import avec `ssr: false`.                                      |
| `src/components/ProductDetail.tsx`                              | Gros composant, pas lazy.                          | Envisager dynamic import pour partie below-the-fold.                   |
| `src/components/ui/HeroSection.tsx`                             | `Image` avec `sizes="100vw"` uniquement.           | `sizes` responsive (ex. `(max-width: 768px) 100vw, 50vw`) pour le LCP. |
| `src/components/RecentProducts.tsx`                             | `sizes` possiblement trop grossier pour la grille. | Ajuster aux colonnes réelles (ex. 3 colonnes desktop).                 |
| `src/app/[locale]/layout.tsx`                                   | Pas de `loading.tsx` pour le layout locale.        | Ajouter `src/app/[locale]/loading.tsx`.                                |
| `src/app/categorie/page.tsx`                                    | Pas de `loading.tsx`.                              | Ajouter `loading.tsx`.                                                 |
| `src/app/mentions-legales/page.tsx`, `confidentialite/page.tsx` | Pas de `loading.tsx` au niveau segment.            | Ajouter si ces routes sont souvent ouvertes à froid.                   |
| `src/app/api/sitemap/route.ts`                                  | Sitemap uniquement statique.                       | Inclure URLs produits / blog / catégories pour un meilleur SEO.        |

---

## 3. Sécurité

| Fichier                                                     | Problème                                                          | Piste d’amélioration                                                                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/app/api/invoice/route.ts`                              | Pas de vérification session/auth ; le body sert à générer le PDF. | Vérifier la session et que la commande appartient à l’utilisateur (ou token signé).                   |
| `src/app/api/share/route.ts`                                | Pas de rate limiting ; POST + redirect.                           | Ajouter rate limiting (ex. `@/lib/rateLimit`).                                                        |
| `src/app/api/products/route.ts`                             | GET sans rate limit.                                              | Envisager rate limiting pour l’API publique.                                                          |
| `src/app/api/ai/chat/route.ts`, `generate-summary/route.ts` | Stubs 501 ; à l’implémentation : auth + rate limit.               | Ajouter auth et rate limiting avant branchement OpenAI.                                               |
| `src/app/api/health/route.ts`                               | Expose `version` et `env`.                                        | Éviter d’exposer la version en prod ou restreindre à un usage interne/monitoring.                     |
| `src/app/api/admin/revalidate/route.ts`                     | Vérification token sans rate limit.                               | Ajouter rate limiting pour limiter le brute-force.                                                    |
| `src/components/AdminLayout.tsx`                            | Vérif avec `NEXT_PUBLIC_ADMIN_TOKEN` (nom exposé côté client).    | Ne pas utiliser `NEXT_PUBLIC_*` pour l’auth admin ; session serveur ou cookie signé.                  |
| `dangerouslySetInnerHTML` (JSON-LD, etc.)                   | Données dans le HTML.                                             | S’assurer que seules des données serveur/build ou sanitized sont utilisées (pas d’input utilisateur). |
| `src/components/DarkModeScript.tsx`                         | `dangerouslySetInnerHTML` avec code généré.                       | S’assurer que le code est uniquement généré côté serveur, sans input utilisateur.                     |

---

## 4. Accessibilité

| Fichier                                    | Problème                                                           | Piste d’amélioration                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `src/components/ui/SlideOverPanel.tsx`     | Pas de focus trap ; seulement focus sur le bouton fermer + Escape. | Ajouter un focus trap (ex. comme dans `Modal.tsx` avec `useFocusTrap`) pour garder le focus dans le panneau.       |
| `src/components/checkout/CheckoutForm.tsx` | `aria-describedby` sur email/adresse.                              | S’assurer que les ids pointent bien vers le message d’erreur quand `errors.email` / `errors.address` sont définis. |
| `src/components/Footer.tsx` (newsletter)   | `aria-invalid` sur l’input email.                                  | Lier le message d’erreur avec `aria-describedby` ou `aria-errormessage`.                                           |
| Plusieurs pages                            | Plusieurs `<h1>` ou ordre de titres peu clair.                     | Un seul `<h1>` visible par vue et hiérarchie logique (h1 → h2 → h3).                                               |
| `src/components/Modal.tsx`                 | Utilise `useFocusTrap`.                                            | Vérifier que le focus revient à l’élément déclencheur à la fermeture.                                              |

---

## 5. SEO

| Fichier                                  | Problème                                                                     | Piste d’amélioration                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/app/layout.tsx`                     | `canonical: '/fr'` peut ne pas convenir à toutes les URLs.                   | Canonical dépendant de la locale (layout ou par route).                                        |
| `src/components/SEOHead.tsx`             | Logique canonical/hreflang ; certaines pages ne s’appuient que sur Metadata. | Chaque page publique avec `metadata` / `generateMetadata` (canonical + hreflang si pertinent). |
| `src/app/products/[slug]/page.tsx`       | "Produit introuvable" en dur dans les metadata.                              | Clés de traduction pour titre/description.                                                     |
| `src/app/products/packs/[slug]/page.tsx` | "Pack introuvable – TechPlay" en dur.                                        | i18n.                                                                                          |
| `src/app/not-found.tsx`                  | "Page introuvable – TechPlay" en dur.                                        | i18n.                                                                                          |
| `src/components/JsonLd/index.ts`         | Pas d’export FaqJsonLd (commentaire).                                        | Ajouter FAQ JSON-LD où le contenu FAQ est affiché.                                             |
| `src/lib/sitemap.ts`                     | Sitemap statique uniquement.                                                 | Inclure produits, blog, catégories dans le sitemap.                                            |

---

## 6. i18n

| Fichier                                                            | Problème                                                     | Piste d’amélioration                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `src/components/ProductGrid.tsx`                                   | "Chargement…" / "Charger plus" en dur.                       | `useTranslations('common')` (ex. `loading`, `load_more`).                  |
| `src/components/ProductSkeleton.tsx`                               | "Chargement du produit…" en dur.                             | Messages.                                                                  |
| `src/components/AdminStatsBlock.tsx`                               | "Chargement des statistiques…" en dur.                       | Messages.                                                                  |
| `src/components/BestProducts.tsx`                                  | "Réinitialiser", "Chargement des meilleures ventes…" en dur. | Messages.                                                                  |
| `src/components/AdminBlogTable.tsx`                                | "Erreur…", "Chargement des articles…" en dur.                | Messages.                                                                  |
| `src/components/AdminReviewTable.tsx`                              | "Erreur…", "Chargement des avis..." en dur.                  | Messages.                                                                  |
| `src/components/FeedbackButton.tsx`                                | "Merci pour votre retour" en dur.                            | Messages.                                                                  |
| `src/components/Footer.tsx`                                        | "Inscription confirmée. Bienvenue chez TechPlay !" en dur.   | Messages (ex. `newsletterSuccess`).                                        |
| `src/app/commande/success/page.tsx`                                | "Merci pour votre commande" en dur.                          | Messages.                                                                  |
| Blog, FilterPanel, ProductFilter, categorie                        | "Réinitialiser" / "Réinitialiser les filtres" en dur.        | Clé commune `reset` / `reset_filters` et l’utiliser partout.               |
| `src/components/AIProductSummary.tsx`                              | "Erreur lors de la génération du résumé." en dur.            | Messages.                                                                  |
| `src/components/EditProductForm.tsx`                               | "Chargement...", "Erreur…" en dur.                           | Messages.                                                                  |
| `src/app/[locale]/page.tsx`                                        | Titre de skeleton "Chargement" en dur.                       | Clé de traduction.                                                         |
| `src/lib/emailTemplates.ts`, `sendConfirmationEmail.ts`, API email | Chaînes FR dans les emails.                                  | Templates emails selon locale ou passage de la locale + chaînes traduites. |
| `src/messages/en.json` vs `fr.json`                                | Risque de clés manquantes ou désalignées.                    | Auditer les clés dans les deux fichiers et compléter.                      |

---

## 7. UX et résilience

| Fichier                                              | Problème                                            | Piste d’amélioration                                                                    |
| ---------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/app/[locale]/wishlist/page.tsx`                 | État vide possiblement peu explicite.               | Utiliser/ajouter un composant type `EmptyWishlist` et états loading/empty/error clairs. |
| `src/components/ReviewList.tsx`                      | `throw new Error('Erreur réseau')` sans retry.      | Utiliser un client API / fetcher avec retry + timeout et UI "Réessayer".                |
| Error boundaries                                     | Présents sur error, cart, commande, login, account. | Ajouter `error.tsx` pour [locale], products, blog, admin et autres segments clés.       |
| `useRecommendations.ts`, `FAQ.tsx`, `HomeClient.tsx` | Fetch sans client partagé (retry/timeout).          | Utiliser `fetchJSON` ou `fetcher` avec retry/timeout où c’est pertinent.                |
| `src/components/QuantitySelector.tsx`                | Vérifier disabled et aria à min/max.                | S’assurer que disabled et attributs aria sont corrects aux bornes.                      |

---

## 8. Mobile et responsive

| Fichier                             | Problème                                                             | Piste d’amélioration                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/app/globals.css`               | Classe `.touch-target` (44px) ; certains boutons ne l’utilisent pas. | Auditer les éléments interactifs (nav, modales) et appliquer `.touch-target` ou min 44px où il manque. |
| `src/components/ProductGallery.tsx` | Thumbnails `overflow-x-auto` ; risque de layout shift.               | Réserver hauteur/largeur ou `aspect-ratio` pour limiter le CLS.                                        |
| Reste                               | Safe-area, viewport, dvh déjà en place.                              | Conserver la configuration actuelle.                                                                   |

---

## 9. Configuration et DevOps

| Fichier             | Problème                                                       | Piste d’amélioration                                                                                                  |
| ------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/env.ts`        | Validation limitée à quelques variables client.                | Valider toutes les variables utilisées côté client au build/start (schéma ou objet env validé).                       |
| `src/env.server.ts` | En prod, seule `STRIPE_SECRET_KEY` est imposée.                | Documenter et optionnellement imposer les autres variables serveur en prod.                                           |
| `.env.example`      | N’inclut pas OPENAI, FIREBASE, VAPID, BRAND, etc.              | Lister toutes les variables utilisées dans le code ou les documenter (ex. docs/ENV.md) et garder .env.example à jour. |
| `next.config.mjs`   | CSP avec `'unsafe-inline'` et `'unsafe-eval'` pour script-src. | Prévoir migration vers nonces/hashes pour durcir la CSP.                                                              |
| `tsconfig.json`     | `strict: true` mais pas `noUncheckedIndexedAccess`.            | Ajouter `noUncheckedIndexedAccess: true`.                                                                             |
| `package.json`      | Pas d’overrides pour les dépendances transitives.              | Garder Next aligné avec React 19 ; lancer `npm audit` et traiter les vulnérabilités modérées et plus.                 |

---

## 10. Tests et documentation

| Fichier / zone              | Problème                                                   | Piste d’amélioration                                                                                      |
| --------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/**`                    | Pas de `*.test.ts` / `*.spec.ts` sous src.                 | Ajouter des tests unitaires pour : `formatPrice`, `lib/checkout`, helpers auth, logique panier/wishlist.  |
| `e2e/critical-path.spec.ts` | Un seul scénario E2E (home → produit → panier → checkout). | Ajouter E2E pour wishlist, login, compte, 404 ; envisager tests a11y ou visuels.                          |
| `README.md`                 | À garder à jour.                                           | Mentionner les variables d’environnement requises (ou lien vers docs/ENV.md) et comment lancer les tests. |
| `docs/`                     | Plusieurs fichiers d’audit (AUDIT.md, CODE_MORT.md, etc.). | Clarifier le rôle de chaque doc ou les fusionner pour éviter les doublons.                                |

---

## Ordre de priorité suggéré

1. **Sécurité** : API facture (auth/session), admin token (pas en NEXT_PUBLIC), rate limiting sur share/revalidate/health si besoin.
2. **Accessibilité** : Focus trap dans SlideOverPanel, aria-describedby/errormessage sur formulaire checkout et newsletter.
3. **i18n** : Remplacer les chaînes en dur les plus visibles (account, commande success, ProductGrid, BestProducts, Footer, not-found, produits/packs introuvables).
4. **Résilience** : error.tsx pour [locale], products, blog, admin ; retry + UI sur ReviewList et autres fetches critiques.
5. **Performance** : Dynamic import ChatBot, ProductAssistant ; loading.tsx [locale], categorie ; sitemap dynamique.
6. **Qualité** : formatPrice dans commande, eslint exhaustive-deps en warn, noUncheckedIndexedAccess.
7. **Tests** : Tests unitaires sur utils/checkout/auth/panier ; E2E wishlist, login, 404.
8. **Config** : .env.example et docs/ENV.md à jour ; validation env étendue.

---

_Document généré par audit automatisé du projet TechPlay._
