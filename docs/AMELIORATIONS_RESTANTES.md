# Améliorations et compléments possibles – TechPlay

Liste non exhaustive de ce qui peut encore être amélioré ou complété sur le site.

---

## Déjà bien en place

- **Mentions légales** : contenu complet FR/EN, sommaire, liens (contact, confidentialité, CGV), SEO.
- **CGV** : 13 articles, sommaire, liens contextuels (contact, mentions), SEO.
- **Blog** : traductions, métadonnées selon la locale, pagination.
- **Contact** : formulaire, toasts erreur, métadonnées + canonical.
- **Panier** : métadonnées localisées.
- **Changement de langue** : rechargement forcé sur /blog, /contact, etc. quand l’URL ne change pas.
- **Empty states** : pattern unifié (cart, wishlist).
- **Images produit** : `lib/productImage.ts` centralisé.
- **Cohérence** : imports `@/`, typecheck, lint, i18n (67 clés racine identiques FR/EN).

---

## À compléter ou améliorer

### 1. Politique de confidentialité

- **Fait** : page `/confidentialite` en i18n (namespace `confidentialite`), sommaire, ancres, liens (contact, mentions, CGV), `generateMetadata` + `generateMeta()`.

### 2. Métadonnées encore en français uniquement

- **Fait** : Login, Commande, Success, Compte, Recherche utilisent `generateMetadata()` + clés `seo` et `generateMeta()`. Confidentialité déjà traitée en §1.
- **Optionnel** : `maintenance/page.tsx` (metadata en dur).

### 3. Page Catégories

- **Fait** : `generateMetadata()` et breadcrumb/JSON-LD utilisent `getTranslations('category')` et `nav.home`.

### 4. Nettoyage optionnel

- **Fait** : `src/components/ui/SectionTitle.tsx` (children) supprimé (inutilisé).
- **Doublons de chemins** : certains fichiers apparaissent avec `src\` et `src/` dans les résultats (même fichier, séparateur Windows). Aucune action technique nécessaire.

### 5. Performance / technique (optionnel)

- **ImageWithZoom** : utiliser `next/image` ou retirer si inutilisé.
- **FAQ / BlogCard** sur la home : déjà en `dynamic()` ; possible lazy-load plus agressif si besoin.
- **Réponses d’API** : format d’erreur standardisé via `apiError()` / `apiSuccess()` dans `lib/apiResponse.ts`. Plusieurs routes admin (contact-submissions, newsletter-subscribers, import-products) ont été migrées ; le reste peut suivre le même pattern.

### 6. Accessibilité (optionnel)

- **Fait** : Modal (`src/components/Modal.tsx`) utilise `trapFocus` (par défaut) et `restoreFocus` (focus restauré sur l’élément déclencheur à la fermeture). Skip link « Aller au contenu » présent dans le layout, `main` avec `id="main"` et `aria-busy` sur les états de chargement.
- Vérifier les `alt` des images (Logo sans texte déjà corrigé).

---

## Ordre recommandé

1. **Politique de confidentialité** : contenu complet i18n + sommaire + liens + SEO (cohérent avec mentions/CGV).
2. **Métadonnées** : login, commande, success, account, search, confidentialité en `generateMetadata()` + traductions.
3. **Catégories** : metadata + breadcrumb en i18n.
4. Le reste selon priorité projet (nettoyage, perfs, a11y).
