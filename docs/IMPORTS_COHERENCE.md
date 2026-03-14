# Vérification des imports et cohérence

*Vérification effectuée sur l’ensemble du projet.*

## 1. Résolution des imports (TypeScript)

- **`npm run typecheck`** (tsc --noEmit) : **OK** — tous les chemins d’import résolvent vers des fichiers existants et les types sont valides.

## 2. Alias et chemins

- **Alias `@/*`** : configuré dans `tsconfig.json` → `src/*`. Tous les imports `@/...` pointent bien sous `src/`.
- **SectionWrapper** : un seul fichier utilisé, `@/components/SectionWrapper`. L’ancien doublon `ui/SectionWrapper` a été supprimé (voir CODE_MORT.md).

## 3. Incohérences corrigées

### logEvent

- **Avant** : `StickyCartSummary` utilisait `import logEvent from '@/lib/logEvent'` (default), les autres `import { logEvent } from '@/lib/logEvent'` (named).
- **Après** : tout le monde utilise `import { logEvent } from '@/lib/logEvent'`.
- **Fichier** : `src/lib/logEvent.ts` exporte à la fois `export function logEvent` et `export default logEvent`. Les deux sont valides ; on a uniformisé sur le **named export**.

### useCart

- **Avant** : la plupart des composants importaient `useCart` depuis `@/hooks/useCart`, mais `CartReminder`, `DynamicPromoBanner`, `CartIndicator`, `UpsellProducts` importaient depuis `@/context/cartContext`.
- **Après** : tous importent `import { useCart } from '@/hooks/useCart'`.
- **Règle** : pour l’usage du panier, toujours passer par **`@/hooks/useCart`**. Réserver **`@/context/cartContext`** pour le **`CartProvider`** (ex. dans `RootLayoutClient`).

## 4. Conventions recommandées

| Ressource        | Import à utiliser                          | Remarque |
|------------------|--------------------------------------------|----------|
| Panier (hook)    | `import { useCart } from '@/hooks/useCart'` | Point d’entrée unique pour les composants. |
| CartProvider     | `import { CartProvider } from '@/context/cartContext'` | Uniquement pour envelopper l’app. |
| logEvent         | `import { logEvent } from '@/lib/logEvent'` | Named export. |
| RatingStars      | `import RatingStars from '@/components/RatingStars'` ou `@/components/ui/RatingStars` | Les deux marchent (ui réexporte le composant principal). |
| Utils (cn, etc.) | `import { cn, formatPrice } from '@/lib/utils'` | Depuis `@/lib/utils`. |
| SectionWrapper   | `import SectionWrapper from '@/components/SectionWrapper'` | Un seul fichier (plus de doublon dans ui). |

## 5. Barrels (index) vérifiés

- **`src/lib/seo/index.ts`** : exporte `OGMetaTags` (composant peu ou pas utilisé ; voir CODE_MORT.md).
- **`src/components/seo/index.ts`** : exporte `SEOHead`, `getFallbackDescription`, `defaultMeta`, `SeoMonitor`, `OGMetaTags`, `useBreadcrumbSegments` — tous existent et sont cohérents.
- **`src/hooks/useCart.ts`** : réexporte `useCart` et les types depuis `@/context/cartContext` — cohérent.

## 6. Réexports dans `components/ui/`

Plusieurs fichiers sous `components/ui/` réexportent depuis le parent (ex. `../Modal`, `../LoadingOverlay`). Les chemins relatifs sont corrects et les fichiers cibles existent. Aucune incohérence détectée.

## 7. Résumé

- **Résolution** : tous les imports sont valides (vérifiés par TypeScript).
- **Cohérence** : logEvent et useCart ont été uniformisés comme ci‑dessus.
- **Conventions** : ce document sert de référence pour les prochains ajouts (hooks pour useCart, named pour logEvent, alias `@/`).
