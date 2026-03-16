# Code mort / à nettoyer

_Vérification effectuée après audit._

## 1. Fichiers jamais importés (libs dépréciées)

Ces fichiers sont marqués `@deprecated` et **aucun import** ne les référence. Tu peux les supprimer ou les déplacer dans un dossier `_deprecated/` si tu veux les garder en backup.

| Fichier                            | Note                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/lib/firebase-client.ts`       | Firebase client (push) – non branché                                  |
| `src/lib/firebase-admin.ts`        | Firebase admin – non branché                                          |
| `src/lib/mongoClientPromise.ts`    | Connexion Mongo – remplacée par `@/lib/dbConnect` ou `@/lib/db/mongo` |
| `src/lib/sanity.ts`                | Client Sanity CMS – non branché                                       |
| `src/lib/translate.ts`             | Google Translate – non branché                                        |
| `src/lib/sendConfirmationEmail.ts` | Remplacé par `@/lib/email` ou `@/lib/email/sendBrevo`                 |
| `src/lib/performance.ts`           | Métriques perf optionnelles – non importé                             |
| `src/lib/ai-tools.ts`              | Préférer `@/lib/openai.ts`                                            |

## 2. Composants UI non utilisés

Aucun import trouvé pour ces composants. À supprimer ou à réutiliser si prévu plus tard.

| Fichier                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| `src/components/ui/SectionWrapper.tsx` (doublon : `SectionWrapper` utilisé vient de `src/components/SectionWrapper.tsx`) |
| `src/components/ui/HeroSection.tsx`                                                                                      |
| `src/components/ui/IconLabel.tsx`                                                                                        |
| `src/components/ui/PricingHighlight.tsx`                                                                                 |
| `src/components/ui/SlideOverPanel.tsx`                                                                                   |
| `src/components/ui/AlertMessage.tsx`                                                                                     |
| `src/components/ui/ABTestLabel.tsx`                                                                                      |
| `src/components/ui/ProductPriceTag.tsx`                                                                                  |
| `src/components/ui/ReviewVerifiedBadge.tsx`                                                                              |
| `src/components/ui/ProgressBar.tsx`                                                                                      |
| `src/components/ui/Alert.tsx`                                                                                            | Aucun import trouvé |

**Correction appliquée :** `src/components/ui/SectionWrapper.tsx` (doublon) a été supprimé.

## 3. Dépréciés mais encore référencés

- **StarsRating** : utilisé dans `PackDetails.tsx` ; déprécié au profit de `<RatingStars />` – migrer puis supprimer.
- **OGMetaTags** : exporté par `lib/seo` et `components/seo` mais **jamais importé** dans l’app (Metadata API utilisée à la place). Composant + ré-exports = code mort.

## 4. Recommandations

1. Supprimer le doublon **`src/components/ui/SectionWrapper.tsx`** (personne ne l’importe).
2. Soit supprimer les libs de la section 1, soit les déplacer dans `src/lib/_deprecated/`.
3. Soit supprimer les composants UI de la section 2, soit les déplacer dans `src/components/ui/_unused/` si tu veux les garder.
4. Retirer **OGMetaTags** de `lib/seo/index.ts` (et éventuellement supprimer le composant) ou documenter qu’il est legacy.
5. Remplacer **StarsRating** par **RatingStars** dans `PackDetails.tsx`, puis supprimer `StarsRating.tsx`.
