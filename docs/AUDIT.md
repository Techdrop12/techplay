# Audit TechPlay – Rapport complet

_Dernière mise à jour : mars 2025_

## Corrections déjà appliquées (suite à cet audit)

- **a11y** : MetaPixel noscript `<img>` → `alt=""` ; BlogCard image → `alt={article.title}`.
- **i18n** : QuantitySelector (diminuer/augmenter la quantité, valeur) → `common.quantity_*` ; CartPageClient (fil d’Ariane, titre, liens, annonces sr) → `cart.*` + `nav.*` ; ClientOnly fallback → composant `LoadingLabel` avec `common.loading`.
- **Messages** : clés ajoutées dans `common` (quantity_decrease, quantity_increase, quantity_value) et `cart` (breadcrumb_aria, cart_content_aria, page_title, explore_products, cart_empty_sr, items_in_cart_sr, items_added_sr, items_removed_sr).

## 1. Internationalisation (i18n)

### État actuel

- **next-intl** en place avec `fr` et `en`, namespaces (common, nav, cart, checkout, blog, etc.).
- Beaucoup de composants et pages ont été migrés vers `useTranslations()`.

### Restant à traduire (priorité haute)

| Zone              | Fichier(s)                                                                 | Exemple                                                          |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Layout            | Header.tsx, MobileNav.tsx                                                  | "Rechercher… ex :", "Voir le panier", "Fil d'Ariane"             |
| Panier / Commande | CartPageClient.tsx, commande/page.tsx                                      | "Mon panier", "Voir les packs", "Total", "Fil d'Ariane"          |
| Checkout          | CheckoutForm.tsx, OrderSummary.tsx                                         | "Paiement sécurisé", "Sous-total", "Total à payer", "CGV"        |
| Catalogue         | ProductFilter.tsx, SearchBar.tsx, categorie/[category]                     | Placeholders recherche, "Réinitialiser les filtres", options tri |
| Produit           | QuantitySelector.tsx, ProductGallery.tsx, TrustBadges.tsx                  | aria-labels (quantité, galerie, badges)                          |
| Pages             | contact, mentions-legales, categorie, products/packs, blog                 | Titres, descriptions, boutons                                    |
| Divers            | Breadcrumbs.tsx, Reassurance.tsx, DeliveryEstimate.tsx, FeedbackButton.tsx | "Accueil", "Livraison offerte dès 50 €", etc.                    |

### Recommandations

- Créer les clés manquantes dans `src/messages/fr.json` / `en.json` (aria, breadcrumb, checkout, catalogue).
- Remplacer tout texte visible et aria par `t('key')` dans les composants listés.
- Pour les pages serveur (contact, CGV, etc.), utiliser un bloc client pour les liens/CTA ou `getTranslations()` si async.

---

## 2. Accessibilité (a11y)

### Corrigé ou déjà bon

- Modal.tsx : piège à focus et restauration du focus.
- Nombreux aria-label sur boutons et liens.

### À corriger

| Fichier                                                | Problème                                        | Action                                                              |
| ------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------- |
| MetaPixel.tsx                                          | `<img>` noscript sans `alt`                     | Ajouter `alt=""` (décoratif / tracking).                            |
| BlogCard.tsx                                           | Image avec `alt=""` alors que contenu éditorial | Utiliser le titre de l’article pour `alt`.                          |
| HeroCarousel.tsx                                       | Images slides avec `alt=""`                     | Alt descriptif par slide si contenu significatif.                   |
| ConsentBanner.tsx                                      | `role="dialog"` sans focus trap                 | Piéger le focus dans le bandeau (Tab/Shift+Tab).                    |
| ExitIntentPopup.tsx, PopupEmailCapture.tsx             | Dialog sans focus trap                          | Idem : focus trap + focus initial sur le premier focusable.         |
| ProductGallery.tsx                                     | Lightbox sans focus trap                        | Piéger le focus dans la lightbox, focus sur image ou bouton fermer. |
| ProductFilter.tsx, SearchBar.tsx, categorie/[category] | Champs avec seulement placeholder               | Ajouter `aria-label` ou `<label>` visible pour le nom accessible.   |
| QuantitySelector.tsx                                   | Changement de valeur peu annoncé                | Ajouter `aria-live="polite"` ou `role="status"` pour la valeur.     |

### Bonnes pratiques

- Tous les champs de formulaire : label visible ou `aria-label`.
- Tous les dialogs/modals : focus trap + retour du focus à l’ouverture/fermeture.
- Images de contenu : `alt` descriptif ; images décoratives : `alt=""`.

---

## 3. Qualité de code & TypeScript

### Points positifs

- TypeScript strict, ESLint (Next, React, a11y).
- Composants typés, types centralisés (Product, etc.).

### À surveiller

- **Duplication** : libellés "Chargement…", "Retour à l'accueil" encore en dur dans quelques endroits → centraliser dans `common` et les réutiliser.
- **Composants lourds** : HeroCarousel, ProductGallery → envisager découpage ou lazy-load des parties secondaires.
- **Erreurs** : utiliser `getErrorMessage()` partout pour afficher des messages utilisateur cohérents.

### Recommandations

- Exécuter régulièrement `npm run typecheck` et `npm run lint`.
- Limiter les `any` et privilégier des types explicites pour les props et les réponses API.

---

## 4. Performance & SEO

### Déjà en place

- next/image pour les images.
- Metadata sur les pages principales.
- Revalidation, lazy loading de sections.

### Recommandations

- Vérifier les balises meta (title, description) par page et par locale.
- S’assurer que les images produits/carousel ont des dimensions ou `sizes` adaptés pour éviter le layout shift.
- Analyser le bundle avec `npm run analyze` et réduire les imports inutiles.

---

## 5. Sécurité

### Bonnes pratiques observées

- Variables sensibles en `process.env`, pas de clés en dur.
- Validation côté API (Zod, etc.).

### Recommandations

- Ne pas exposer de données sensibles dans les réponses API (hash mots de passe, tokens).
- Vérifier les droits (admin, utilisateur) sur les routes et APIs sensibles.

---

## Synthèse des actions prioritaires

1. **i18n** : Compléter les clés manquantes (aria, breadcrumb, checkout, catalogue) et brancher les composants restants.
2. **a11y** : Ajouter `alt` où il manque, focus traps dans les dialogs, noms accessibles pour les champs de recherche/filtres.
3. **Qualité** : Centraliser les chaînes répétées, garder typecheck/lint à zéro warning.
4. **SEO/Perf** : Contrôler meta et images, lancer un analyze de bundle si besoin.
