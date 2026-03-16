# Audit détaillé du projet TechPlay

_Dernière mise à jour : vérification globale (structure, doublons, erreurs, améliorations)._

---

## 1. Structure et configuration

- **Stack** : Next.js 16, React 19, TypeScript, Mongoose, Stripe, next-intl.
- **Config** : `tsconfig` strict, `@/*` → `src/*`, `next.config.mjs` (CSP, security headers, redirects produit→products, pack→packs, `removeConsole` en prod sauf error/warn).
- **Environnement** : Pas de `.env` versionné (`.env*` dans `.gitignore`). Utiliser `.env.local` en local.

---

## 2. APIs et routes

| Route                          | Méthode       | Rôle                                                    |
| ------------------------------ | ------------- | ------------------------------------------------------- |
| `/api/checkout`                | POST, GET     | Session Stripe (rate limit manuel), GET = 405           |
| `/api/stripe-webhook`          | POST          | Webhook Stripe, création commande, idempotence          |
| `/api/admin/revalidate`        | POST          | Revalidation cache (tag/path) avec token                |
| `/api/review`                  | POST          | Avis produit (rate limit, ReCAPTCHA optionnel, MongoDB) |
| `/api/email/welcome`           | POST          | Inscription bienvenue (rate limit)                      |
| `/api/brevo/abandon-panier`    | POST          | Abandon panier (rate limit, Brevo non branché)          |
| `/api/notifications/subscribe` | POST          | Web-push (rate limit, persistance non impl.)            |
| `/api/reminder-inactifs`       | POST          | Relance inactifs (rate limit, envoi non impl.)          |
| `/api/cron/publish-blog`       | GET           | Cron publication blog (CRON_SECRET)                     |
| `/api/share`                   | POST          | Redirect vers `/products?q=...` (limite 2000 car.)      |
| `/api/sitemap`                 | GET           | Sitemap XML (Edge, revalidate 1h)                       |
| `/api/user/[id]/score`         | GET           | Score gamification                                      |
| `/api/og`                      | GET           | Image OG dynamique (Edge)                               |
| `/api/faq`                     | GET           | FAQ JSON statique                                       |
| `/api/products`                | GET           | Produits recommandés (MongoDB)                          |
| `/api/invoice`                 | POST, OPTIONS | Génération PDF facture (CORS)                           |

**Routes API AI (stubs 501)** :

- `/api/ai/chat` — POST, retourne 501 « Chat IA non configuré » (ChatBot, ProductAssistant)
- `/api/ai/generate-blog` — POST, retourne 501 « Génération d’article IA non configurée » (GenerateBlogPost)
- `/api/ai/generate-summary` — POST, retourne 501 « Résumé IA non configuré » (AIProductSummary)

À implémenter (OpenAI ou autre) pour activer les fonctionnalités.

---

## 3. Variables d’environnement (doublons et centralisation)

**Déjà centralisées** :

- **`src/env.server.ts`** : Stripe, BRAND*\*, MONGODB*\_, NEXTAUTH/AUTH, ADMIN\_\_, CRON*SECRET, BREVO*\*, RECAPTCHA_SECRET_KEY. Utilisé par checkout, webhook, review, revalidate, cron, invoice.
- **`src/env.ts`** : NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_META_PIXEL_ID (client).
- **`src/lib/constants.ts`** : BRAND, SEO_DEFAULTS, LEGAL, UI (dont `NEXT_PUBLIC_FREE_SHIPPING` — nom différent du reste du projet).

**Réduit / centralisé** :

- **NEXT_PUBLIC_SITE_URL** : source unique dans `constants.ts` (BRAND.URL) ; utilisé partout via `BRAND.URL`. `sendConfirmationEmail.js` utilise BRAND + fallback env.
- **NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD** : source unique `UI.FREE_SHIPPING_THRESHOLD` dans `constants.ts`. `FreeShippingBadge` et `StickyCartSummary` utilisent cette constante (plus de lecture directe env ni défaut 49/50 en dur).
- **NEXT_PUBLIC_WISHLIST_LIMIT** : centralisé dans `constants.ts` (UI.WISHLIST_LIMIT) ; utilisé par `wishlist.ts`, `WishlistButton.tsx`, `useWishlist.ts`.

---

## 4. Code dupliqué et incohérences

**Corrigé dans cet audit** :

- **getErrorMessage** : doublon dans `api/review/route.ts` et `InvoiceButton.tsx` supprimé. `@/lib/errors` gère aussi les erreurs de type Zod (par forme). `InvoiceButton` utilise `getInvoiceErrorMessage()` qui s’appuie sur `getErrorMessage` + messages spécifiques facture/AbortError.
- **api/share** : limite 2000 caractères sur la query, trim, utilisation de `origin` pour l’URL de redirect.
- **Logger** : une seule implémentation dans `logger.ts` ; `logger.js` réexporte depuis `logger.ts` (plus de code dupliqué).
- **CSS** : keyframe `slideUpStagger` et `color-scheme` en doublon supprimés de `globals.css` (définis dans `design-tokens.css`).

**En place** :

- **`src/lib/parseJsonBody.ts`** : helper `parseJsonBody(req, schema)` pour parser le JSON et valider avec Zod ; utilisé dans `api/email/welcome` et `api/brevo/abandon-panier`. Les autres routes peuvent migrer au même pattern.

**À considérer** :

- Rate limiting : même pattern `createRateLimiter` + `withRateLimit` sur plusieurs routes — cohérent, éventuellement wrapper commun (optionnel).

---

## 5. TODOs dans le code

- **`src/lib/cron.ts`** :
  - Brancher la logique réelle pour « Articles programmés ».
  - Brancher la relance panier abandonné (ex. `sendAbandonedCart(to, product)`).
  - Implémenter le nettoyage des anciennes sessions/notifications.

---

## 6. Console et logger

- **`src/lib/logger.ts`** : log/warn/error uniquement en `NODE_ENV === 'development'`. Utilisé par stripe-webhook, checkout, review, cron.
- **next.config** : `removeConsole` en prod en gardant error et warn.
- **Encore des `console.*` directs** (à migrer vers le logger ou un guard dev au besoin) :
  - `lib/openai.ts`, `lib/dbConnect.js`, `lib/db/mongo.js`, `lib/email/sendBrevo.js`, `lib/abandon-cart.ts`, `lib/ai-blog.js`, `lib/notifications.ts`, `lib/utils/onErrorLogger.js`, `lib/useAnalytics.js`, `lib/seo/seoMonitor.ts`, `lib/performance.ts`, `lib/cart.ts`
  - Composants : `FAQ.tsx`, `SeoMonitor.js`, `AbandonCartTracker.tsx`, `CheckoutForm.tsx`, `MetaPixel.tsx`, `PushSubscribe.tsx`, `PurchaseTracker.tsx`
  - `app/error.tsx` : `console.error` (peut rester pour erreur racine ou passer par le logger).

---

## 7. Fichiers potentiellement morts ou redondants

**Probablement jamais importés** :

- `src/lib/sendConfirmationEmail.js` — non importé.
- `src/lib/sendBrevoEmail.js` — uniquement par `sendConfirmationEmail.js` ; envoi actuel via `@/lib/email` et `lib/email/sendBrevo.js`.
- `src/lib/mongoClientPromise.js` — non importé ; accès DB via `dbConnect.js` et `lib/db.ts` / `lib/db/mongo.js`.
- `src/lib/translate.js` — non importé.
- `src/lib/sanity.js` — non importé.
- `src/lib/firebase-admin.js` — non importé.
- `src/lib/firebase-client.js` — non importé.
- `src/lib/performance.ts` — non importé.
- `src/lib/ai-blog.js` — non importé (et `/api/ai/generate-blog` n’existe pas).
- `src/lib/ai-tools.js` — non importé.

**Redondant** :

- Deux implémentations Brevo : `sendBrevoEmail.js` et `email/sendBrevo.js`. Une seule est dans le flux actuel ; l’autre peut être supprimée ou documentée comme legacy.

**Composant** :

- `src/components/seo/SeoMonitor.js` — exporté par `components/seo/index.js` mais pas d’import trouvé (les autres utilisent `@/lib/seo`).

À décider : suppression, archivage ou branchement (ex. Firebase, Sanity, AI, traduction) si prévus plus tard.

---

## 8. Erreurs et sécurité

- **revalidateTag** : `revalidateTag(tag, 'max')` est correct (Next 14.2.11+).
- **CORS / origin** : checkout et invoice limitent les origines.
- **Rate limiting** : checkout (manuel), review, welcome, brevo/abandon-panier, reminder-inactifs, notifications/subscribe.
- **Validation** : Zod sur les body des APIs sensibles ; api/share limitée en longueur et en entrée.

---

## 9. Recommandations prioritaires

1. **Créer les routes `/api/ai/*`** (chat, generate-blog, generate-summary) ou **masquer/désactiver** les composants qui les appellent (ChatBot, ProductAssistant, GenerateBlogPost, AIProductSummary).
2. **SITE_URL / BRAND** : centralisé dans `constants.ts` (BRAND.URL) ; utilisé partout. ✅
3. **Seuil livraison gratuite** : centralisé dans `UI.FREE_SHIPPING_THRESHOLD` ; composants utilisent cette constante. ✅
4. **Remplacer les `console.*`** côté serveur par `@/lib/logger` (log/warn/error).
5. **Nettoyer le code mort** : supprimer ou archiver les libs non utilisées (sendConfirmationEmail, sendBrevoEmail, mongoClientPromise, translate, sanity, firebase-\*, performance, ai-blog, ai-tools) après confirmation.
6. **Implémenter ou documenter les TODOs** dans `lib/cron.ts` (publication blog, abandon panier, nettoyage sessions).

---

## 10. Résumé des changements effectués lors de cet audit

- **`src/lib/errors.ts`** : prise en charge des erreurs de type Zod (par forme) dans `getErrorMessage`.
- **`src/app/api/review/route.ts`** : suppression de la fonction locale `getErrorMessage`, utilisation de `@/lib/errors`.
- **`src/components/account/InvoiceButton.tsx`** : utilisation de `getErrorMessage` depuis `@/lib/errors` + helper local `getInvoiceErrorMessage` pour AbortError et message facture.
- **`src/app/api/share/route.ts`** : validation et limite (trim, max 2000 caractères, redirect via `origin`).
- **`tests/lib/errors.test.ts`** : ajout d’un test pour une erreur de type Zod dans `getErrorMessage`.

**Cohérence et doublons (suite)** :

- **Logger** : `logger.js` réexporte `logger.ts` (une seule implémentation).
- **Constantes** : `FreeShippingBadge` et `StickyCartSummary` utilisent `UI.FREE_SHIPPING_THRESHOLD` ; `sendConfirmationEmail.js` utilise `BRAND.URL` + fallback.
- **CSS** : keyframe `slideUpStagger` et `color-scheme` en doublon retirés de `globals.css`.
- **Imports** : `formatPrice` importé depuis `@/lib/utils` dans `CartSummary` et `StickyCartSummary` (point d’entrée unique).
