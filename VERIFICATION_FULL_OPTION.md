# Vérification Full Option – TechPlay

Ce document récapitule toutes les améliorations « full option » et vérifie leur cohérence.

---

## 1. Admin – Structure et protection

| Élément                                                                                                                                                                     | Statut |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Layout admin (`AdminShell`) avec sidebar + header sur toutes les pages                                                                                                      | ✅     |
| `requireAdmin()` sur toutes les API admin                                                                                                                                   | ✅     |
| Sidebar : liens vers Dashboard, Produits, Ajouter produit, Blog, Nouvel article, Avis, Messages contact, Newsletter, Pages légales, Commandes, Import, Générer article (IA) | ✅     |
| Toutes les pages admin existent et correspondent aux liens                                                                                                                  | ✅     |

---

## 2. Admin – Produits

| Fonctionnalité         | API                                                                                          | Page / Composant                             | Cohérent |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- | -------- |
| Liste paginée          | `GET /api/admin/products?page=&limit=&q=&category=` → `{ items, total, page, limit, pages }` | `ProductTable` (page, filtre, recherche)     | ✅       |
| Catégories pour filtre | `GET /api/admin/products/categories`                                                         | `ProductTable` (dropdown)                    | ✅       |
| Création               | `POST /api/admin/products`                                                                   | `/admin/produits/nouveau` + `AddProductForm` | ✅       |
| Édition                | `GET/PUT /api/admin/products/[id]`                                                           | `/admin/produit/[id]` + `EditProductForm`    | ✅       |
| Suppression            | `DELETE /api/admin/products/[id]`                                                            | `ProductTable` (bouton Supprimer)            | ✅       |
| Import CSV/JSON        | `POST /api/admin/import-products`                                                            | `/admin/import` + `ImportProductsTable`      | ✅       |

---

## 3. Admin – Blog

| Fonctionnalité                     | API                                 | Page / Composant                          | Cohérent |
| ---------------------------------- | ----------------------------------- | ----------------------------------------- | -------- |
| Liste (tous statuts)               | `GET /api/blog/all` (tableau)       | `AdminBlogTable`                          | ✅       |
| Création                           | `POST /api/blog`                    | `/admin/blog/nouveau` + `AddBlogPostForm` | ✅       |
| Édition                            | `GET/PUT /api/blog/[id]`            | `/admin/blog/[id]` + `EditBlogPostForm`   | ✅       |
| Publier / Dépublier                | `POST /api/blog/toggle-publish?id=` | `AdminBlogTable` (lien par ligne)         | ✅       |
| Suppression                        | `DELETE /api/blog/delete?id=`       | `AdminBlogTable`                          | ✅       |
| Filtre Tous / Publiés / Brouillons | —                                   | `AdminBlogTable` (client-side)            | ✅       |

---

## 4. Admin – Commandes

| Fonctionnalité      | API                                                                                   | Page / Composant                                                 | Cohérent |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Liste paginée       | `GET /api/admin/orders?page=&limit=&status=` → `{ items, total, page, limit, pages }` | `OrderTable`                                                     | ✅       |
| Modification statut | `PATCH /api/admin/orders/[id]` (body `{ status }`)                                    | `OrderTable` (select par ligne)                                  | ✅       |
| Filtre par statut   | Même API avec `status=`                                                               | `OrderTable` (dropdown)                                          | ✅       |
| Export CSV          | —                                                                                     | `OrderTable` (bouton, client-side à partir des données chargées) | ✅       |

---

## 5. Admin – Avis, Contact, Newsletter, Pages légales

| Fonctionnalité                                 | API                                                                              | Page / Composant                                                             | Cohérent |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| Liste avis (paginée)                           | `GET /api/reviews?page=&limit=&rating=` → `{ items, total, page, limit, pages }` | `AdminReviewTable` (pagination + filtre note côté serveur)                   | ✅       |
| Suppression avis                               | `DELETE /api/reviews/[id]`                                                       | `AdminReviewTable`                                                           | ✅       |
| Filtre par note                                | Même API avec `rating=` (1–5)                                                    | `AdminReviewTable` (dropdown, reset page à 1)                                | ✅       |
| Messages contact                               | `GET /api/admin/contact-submissions`                                             | `/admin/contact` + `ContactSubmissionsTable`                                 | ✅       |
| Inscrits newsletter                            | `GET /api/admin/newsletter-subscribers?limit=&skip=`                             | `/admin/newsletter` + `NewsletterSubscribersTable` (pagination + export CSV) | ✅       |
| Pages légales (CGV, mentions, confidentialité) | `GET /api/admin/site-pages?slug=` + `PUT /api/admin/site-pages`                  | `/admin/pages` + `SitePagesEditor` (onglets)                                 | ✅       |

---

## 6. Admin – Analytics et Dashboard

| Fonctionnalité | API                        | Page / Composant                                                                                | Cohérent |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| Statistiques   | `GET /api/admin/analytics` | `AdminStatsBlock`                                                                               | ✅       |
| Dashboard      | —                          | `/admin/dashboard` : stats, aperçu produits, commandes, blog, avis, **actions rapides** (liens) | ✅       |

---

## 7. Côté public – Contact, Recherche, Blog, Produits

| Fonctionnalité        | API / Data                                                                           | Page / Composant                                    | Cohérent |
| --------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- | -------- |
| Formulaire contact    | `POST /api/contact` (validation `contactSchema`, enregistrement `ContactSubmission`) | `/contact` + `ContactForm`                          | ✅       |
| Recherche unifiée     | `getProductsPage({ q })` + `getPosts({ q })`                                         | `/search?q=` et `/[locale]/search?q=`               | ✅       |
| Header / MobileNav    | Envoi vers `L('/search')` avec `q`                                                   | Recherche → page recherche (produits + blog)        | ✅       |
| Section blog homepage | `getPosts({ limit: 3 })`                                                             | `[locale]/page.tsx` (section « Derniers articles ») | ✅       |
| Produits similaires   | `getRelatedProducts(slug, category, 4)`                                              | `/products/[slug]` (section « Vous aimerez aussi ») | ✅       |

---

## 8. Compte utilisateur et Wishlist

| Fonctionnalité                     | API                                                                                       | Page / Composant                                           | Cohérent |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------- |
| Profil (nom)                       | `PATCH /api/account/profile` + `updateUserByEmail`                                        | `/account/profil` + `AccountProfileForm`                   | ✅       |
| Session : nom à jour après édition | Callback `session` dans `auth-options` lit le nom en BDD par email                        | `getSession()` retourne le bon nom                         | ✅       |
| Wishlist (sync connecté)           | `GET/POST/DELETE/PUT /api/wishlist`                                                       | `WishlistClient` (Sauvegarder / Charger depuis mon compte) | ✅       |
| Produits par IDs                   | `GET /api/products/by-ids?ids=`                                                           | Utilisé par « Charger depuis mon compte »                  | ✅       |
| Inscription newsletter (footer)    | `POST /api/notifications/subscribe` (body `email`, enregistrement `NewsletterSubscriber`) | Footer (formulaire existant)                               | ✅       |

---

## 9. Pages légales (public)

| Page             | Source du contenu                                                                   | SEO / i18n                          |
| ---------------- | ----------------------------------------------------------------------------------- | ----------------------------------- |
| CGV              | `getTranslations('cgv')` – 13 articles, sommaire, ancres, liens (mentions, contact) | `generateMeta()` canonical/hreflang |
| Mentions légales | `getTranslations('mentions_legales')` – sections éditeur, hébergeur, données, etc.  | Idem                                |
| Confidentialité  | `getTranslations('confidentialite')` – 12 sections, bloc préférences cookies        | Idem                                |

- Contenu structuré en `fr.json` / `en.json` (namespaces `cgv`, `mentions_legales`, `confidentialite`). Admin > Pages légales (`/admin/pages`) pour édition si besoin.
- API publique : `GET /api/site-pages/[slug]` (sans auth).

---

## 10. Modèles et cohérence technique

| Modèle                 | Utilisation                           |
| ---------------------- | ------------------------------------- |
| `ContactSubmission`    | Contact form, admin contact           |
| `SitePage`             | Pages légales (admin + `getSitePage`) |
| `NewsletterSubscriber` | Newsletter footer, admin newsletter   |
| `Wishlist`             | API wishlist (utilisateurs connectés) |

- Connexion BDD : `connectToDatabase` (`@/lib/db`) ou `dbConnect` selon les fichiers ; les deux sont utilisés de façon cohérente dans le projet.
- Aucune erreur de lint sur les zones admin, API, composants concernés.

---

## 11. Résumé – « Impossible de faire mieux » (full option)

- **Admin** : produits (CRUD, pagination, filtres, import), blog (CRUD, publish/unpublish), commandes (liste paginée, statut, export CSV), avis (liste **paginée**, filtre note côté serveur, suppression), contact (messages), newsletter (inscrits, export), pages légales (édition CGV, mentions, confidentialité), analytics, dashboard avec actions rapides.
- **Public** : contact (formulaire + envoi), recherche (produits + blog), homepage (section blog), fiche produit (produits similaires), compte (profil nom), wishlist (sync si connecté), pages légales (contenu éditable + confidentialité avec toggles).

---

## 12. Corrections appliquées (suite à audit complet)

| Problème                                                                                                                  | Correction                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Page CGV** : `getSitePage('cgv')` appelé sans import → erreur à l'exécution                                             | Ajout de `import { getSitePage } from '@/lib/site-pages'` dans `src/app/cgv/page.tsx`.                                                                                                  |
| **Blog** : `lib/blog.ts` utilisait des champs inexistants (`excerpt`, `coverImage`, `content`, `seo`, `tags`, `category`) | Alignement sur le modèle Blog : projections et recherche utilisent `description` et `image` ; recherche sur `title` et `description` ; `getRelatedPosts` retourne les articles récents. |

---

## 13. Améliorations « full option » (dernier passage)

| Domaine          | Amélioration                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB**           | Connexion unifiée : `db.ts` gère `MONGODB_URI` / `MONGODB_URL` / `MONGO_URL` et `MONGODB_DB` / `MONGO_DB` ; `dbConnect` réexporte `connectToDatabase` et `disconnectDatabase` pour compatibilité.                    |
| **API admin**    | Import produits : réponses d’erreur standardisées `{ error }` (au lieu de `{ success: false, error }`).                                                                                                              |
| **Admin**        | Metadata (title, description, robots) sur toutes les pages admin (dashboard, commandes, blog, avis, import, produits, blog/nouveau, blog/[id], produits/nouveau, produit/[id]) ; layout metadata pour generate-blog. |
| **Recherche**    | `loading.tsx` pour `/[locale]/search` et `/search` (skeleton pendant la navigation).                                                                                                                                 |
| **Contact**      | Validation côté client avec le schéma Zod ; erreurs par champ + `aria-invalid` / `aria-describedby` / `role="alert"` ; affichage de l’erreur API dans une zone `role="alert"` ; `aria-busy` sur le bouton d’envoi.   |
| **Edit produit** | Labels accessibles : chaque champ a un `<label htmlFor="...">` et un `id` ; `aria-labelledby` sur le formulaire.                                                                                                     |
| **Admin tables** | Skeleton de chargement : composant `TableSkeleton` ; utilisé dans ProductTable, OrderTable, ContactSubmissionsTable, NewsletterSubscribersTable.                                                                     |
| **i18n admin**   | Nouvelles clés admin (orders, contact, newsletter) dans `fr.json` et `en.json` ; OrderTable, ContactSubmissionsTable, NewsletterSubscribersTable utilisent `useTranslations('admin')` pour tous les textes.          |

Tout est cohérent et prêt pour une utilisation « full option ». Pour aller au-delà, on pourrait ajouter par exemple : coupons gérés en admin, ou flux d’emails (newsletter) ; ce n’est pas nécessaire pour considérer la version actuelle comme complète et cohérente.

---

## 14. i18n « full option » – Contact, Mes commandes, OrderList, Checkout

| Domaine           | Amélioration                                                                                                                                                                                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contact**       | Page `/contact` entièrement en i18n : `getTranslations('contact')` pour badge, titre, sous-titre, sujets mailto, formulaire, email, téléphone, adresse, horaires, réassurance, bloc « En attendant » + lien FAQ. Clés `contact.*` en `fr.json` et `en.json`.                                              |
| **Mes commandes** | Page `/account/mes-commandes` : `getTranslations('account')` et `getTranslations('orders')` pour lien « Espace client », aria, titre « Mes commandes », message non connecté, bouton « Se connecter ». `generateMetadata` avec `t('orders.my_orders')`.                                                   |
| **OrderList**     | Composant `OrderList` : `useTranslations('orders')` pour liste vide, « Découvrir les produits », compteur (pluriel), recherche, tri, libellé « Commande », total, aria détail, bouton « Détail », statuts (pending, paid, shipped, delivered, canceled). Dates avec `useLocale()` (fr-FR / en-GB).        |
| **Checkout**      | Page `/commande` : `useTranslations('checkout')` pour fil d’Ariane, titre, sous-titre (articles + paiement), panier vide, « Parcourir les produits », « Voir les packs », aria sections, note Stripe, « Total », « Continuer », aria formulaire paiement. Namespace `checkout` en `fr.json` et `en.json`. |

Cohérence : toutes les chaînes visibles sur ces pages sont traduisibles (FR/EN) et les libellés d’accessibilité (aria-label, sr-only) passent par l’i18n.

---

## 15. Améliorations récentes (pagination avis, logger, i18n admin)

| Domaine        | Amélioration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Avis admin** | Pagination : `GET /api/reviews?page=&limit=&rating=` retourne `{ items, total, page, limit, pages }` ; filtre par note côté serveur ; AdminReviewTable avec boutons Précédent/Suivant, `reviews_page_info`, aria pagination.                                                                                                                                                                                                                                                                                               |
| **APIs**       | Tous les `console.error` des routes API remplacés par `@/lib/logger` (error) pour logs assainis en production.                                                                                                                                                                                                                                                                                                                                                                                                             |
| **i18n admin** | OrderTable : `export_csv`, `change_order_status_aria`, `pagination_prev`/`pagination_next`. NewsletterSubscribersTable : `newsletter_export_csv`, `newsletter_page_info`, `newsletter_table_aria`, `error_load_newsletter`, aria pagination. ContactSubmissionsTable : `contact_table_aria`, dates selon `useLocale()`. ProductTable : en-têtes tableau (table_title, table_price, table_stock, table_slug, actions), aria pagination, aria-label sur le tableau. ImportProductsTable : aria-label sur le bouton d’import. |
| **Clés admin** | Ajout dans `fr.json` / `en.json` : `change_order_status_aria`, `newsletter_table_aria`, `newsletter_page_info`, `error_load_newsletter`, `contact_table_aria`, `pagination_prev`, `pagination_next`, `reviews_page_info`.                                                                                                                                                                                                                                                                                                  |

---

## 16. Sécurité, i18n et perf (dernier passage)

| Domaine                    | Vérification                                                                                                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sécurité**               | Voir `docs/SECURITE.md`. Stripe webhook (signature), checkout (Zod + rate limit + Origin), contact (Zod + **rate limit 10 req/min**), avis (rate limit + reCAPTCHA optionnel), cron/revalidate (token timing-safe). En prod : `STRIPE_SECRET_KEY` et `NEXTAUTH_SECRET`/`AUTH_SECRET` obligatoires. |
| **Métadonnées**            | Login, commande, success, account, search, cart, maintenance, catégories : `generateMetadata()` + `getTranslations('seo')` ou namespace dédié + `generateMeta()` (canonical, hreflang).                                                                                                            |
| **i18n**                   | Page recherche : `getTranslations('search')` (titre, hint, produits/blog, untitled). Popup email : namespace `email_popup`. LanguageSwitcher : `change_lang_to`. StickyFreeShippingBar : `close_bar_aria` (misc).                                                                                  |
| **Perf / a11y**            | ImageWithZoom : `loading="lazy"` et `decoding="async"`. Modal : trapFocus + restoreFocus.                                                                                                                                                                                                          |
| **Layout confidentialité** | Metadata statique retirée ; seule la page contrôle le SEO via `generateMetadata()`.                                                                                                                                                                                                                |

Ce document reste la référence pour vérifier que toutes les briques « full option » sont en place et cohérentes.

---

## 17. Gros chantier – UX, erreurs, a11y

| Domaine            | Vérification                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Skip link**      | Composant `SkipLink` dans le layout racine : lien « Aller au contenu » visible au focus (sr-only + focus:not-sr-only).                                                                                                                                                                           |
| **404**            | Page avec liens utiles : Accueil, Voir les produits, Nous contacter, **Recherche**, **Catégories** (i18n `not_found.link_search`, `link_category`).                                                                                                                                              |
| **Erreur + retry** | Composant réutilisable `ErrorWithRetry` (message, onRetry, retryLabel). Utilisé dans **CheckoutForm** en cas d’échec création session Stripe (remplace le bloc d’erreur inline).                                                                                                                 |
| **Focus trap**     | Hook `useFocusTrap(active, containerRef, options)` dans `@/lib/useFocusTrap`. Utilisé dans **ConsentBanner** (dialog cookies) et **PopupEmailCapture** (dialog email) : piège Tab, focus initial, restauration du focus à la fermeture. ProductGallery lightbox avait déjà un trap Tab + Escape. |
| **Loading**        | Pages produits, détail produit, catégorie, recherche ont un `loading.tsx` (skeleton).                                                                                                                                                                                                            |
