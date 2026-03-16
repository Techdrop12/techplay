# Éléments inutiles ou inutilisés

Document généré pour audit. À supprimer ou réutiliser selon besoin.

## Dépendances retirées (package.json)

- **react-toastify** : tout le projet utilise **react-hot-toast** (Toaster dans layout + `toast` dans les composants). Supprimé.
- **micro** : aucune importation dans le projet. Supprimé.

## Composants jamais importés (candidats à suppression)

| Fichier                                       | Rôle                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/CheckoutSteps.tsx`         | Étapes du checkout (step indicator). Le tunnel actuel n’utilise pas ce composant.                                         |
| `src/components/checkout/CheckoutSection.tsx` | Section checkout qui affiche `OrderSummary`. La page commande utilise `CartSummary` + `CheckoutForm`.                     |
| `src/components/checkout/OrderSummary.tsx`    | Résumé commande (sous-total, livraison, etc.). Utilisé uniquement par `CheckoutSection`, lui-même inutilisé.              |
| `src/components/ProductFilter.tsx`            | Filtre/tri produits. Le catalogue utilise `FilterPanel` + `SortDropdown` dans `ProductCatalogue`.                         |
| `src/components/RatingForm.tsx`               | Formulaire de notation. Les avis passent par `ReviewForm`.                                                                |
| `src/components/SkeletonProductCard.tsx`      | Skeleton carte produit. Le projet utilise `ProductSkeleton` (ProductGrid) et `ProductCardSkeleton` (ProductSkeletonGrid). |
| `src/components/ProductSkeletonGrid.tsx`      | Grille de skeletons. Jamais importée (les pages ont leurs propres `loading.tsx`).                                         |

## Composant déprécié

- **`src/components/StarsRating.tsx`** : marqué `@deprecated` au profit de `RatingStars`. Encore utilisé par `PackDetails`. On peut remplacer l’import dans `PackDetails` par `RatingStars` puis supprimer `StarsRating`.

## Doublons / alias

- `RatingSummary` existe en `src/components/RatingSummary.tsx` et en alias `src/components/ui/RatingSummary.tsx` (réexport). Pas un doublon, juste un alias.
- `RatingStars` idem : défini dans `RatingStars.tsx`, réexporté par `ui/RatingStars.tsx`.

Pour nettoyer : supprimer les fichiers listés ci‑dessus (et mettre à jour `PackDetails` si vous supprimez `StarsRating`), puis relancer `npm run ci`.
