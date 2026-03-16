# Répertoire `src/lib` — Guide d’usage

Ce document indique quels modules sont **utilisés en production** et lesquels sont **legacy ou optionnels**.

## Utilisés activement

| Module                                   | Rôle                                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `constants.ts`                           | BRAND, SEO_DEFAULTS, LEGAL, UI, TWITTER_HANDLE — **source unique** pour SITE_URL, SITE_NAME, seuils livraison, wishlist, etc. |
| `env.server.ts`                          | Variables serveur validées (Stripe, MongoDB, Auth, Brevo, CRON, Recaptcha). À privilégier au lieu de `process.env` côté API.  |
| `errors.ts`                              | `getErrorMessage`, `getErrorMessageWithFallback` — extraction de messages d’erreur (dont Zod).                                |
| `logger.ts` / `logger.js`                | Logs dev-only (log, warn, error). Utiliser au lieu de `console.*` côté serveur.                                               |
| `rateLimit.ts`                           | Rate limiting (createRateLimiter, withRateLimit, ipFromRequest).                                                              |
| `parseJsonBody.ts`                       | Helper pour parser le body JSON + validation Zod dans les routes API (ex. welcome, brevo/abandon-panier).                     |
| `db/orders.js`                           | Commandes (getUserOrders, getOrderById, createOrder, etc.).                                                                   |
| `dbConnect.js`                           | Connexion Mongoose partagée.                                                                                                  |
| `db/mongo.js`                            | Connexion Mongo alternative (selon usage projet).                                                                             |
| `email/sendBrevo.js`                     | Envoi transactionnel Brevo.                                                                                                   |
| `email.ts`                               | Envoi SMTP / fallback.                                                                                                        |
| `stripe.ts`                              | Client Stripe.                                                                                                                |
| `auth.ts`, `auth-options.ts`             | NextAuth (session, admin, credentials).                                                                                       |
| `bcrypt.ts`                              | Vérification mot de passe.                                                                                                    |
| `sitemap.ts`                             | Génération sitemap (utilise BRAND.URL).                                                                                       |
| `seo.ts`, `meta.ts`                      | Metadata, canonical, OG (utilisent constants).                                                                                |
| `cron.ts`                                | Tâches planifiées (stub à brancher).                                                                                          |
| `pdf.ts`                                 | Génération factures PDF.                                                                                                      |
| `openai.ts`                              | Client OpenAI (optionnel si clé absente).                                                                                     |
| `notifications.ts`                       | Web Push VAPID.                                                                                                               |
| `i18n-routing`, `language`               | Locales, chemins localisés.                                                                                                   |
| `formatPrice`, `utils`, `ga`, `logEvent` | Helpers UI / tracking.                                                                                                        |

## Legacy ou non branchés

| Module                                    | Statut                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `sendConfirmationEmail.js`                | Non importé. Remplacé par `email/sendBrevo.js` ou `email.ts`.                         |
| `sendBrevoEmail.js`                       | Utilisé uniquement par `sendConfirmationEmail.js`. Doublon avec `email/sendBrevo.js`. |
| `mongoClientPromise.js`                   | Non importé. Connexion via `dbConnect.js` ou `db/mongo.js`.                           |
| `translate.js`                            | Non importé. À brancher si traduction automatique souhaitée.                          |
| `sanity.js`                               | Non importé. À brancher si CMS Sanity utilisé.                                        |
| `firebase-admin.js`, `firebase-client.js` | Non importés. À brancher si Firebase (auth/push) utilisé.                             |
| `performance.ts`                          | Non importé. Métriques perf optionnelles.                                             |
| `ai-blog.js`                              | Utilisé si route `/api/ai/generate-blog` l’appelle. Sinon doublon avec `openai.ts`.   |
| `ai-tools.js`                             | Non importé.                                                                          |

## Règles recommandées

1. **Env** : Côté serveur → `serverEnv` (`env.server.ts`). Côté client / partagé → `constants.ts` (BRAND, UI).
2. **Erreurs** : Utiliser `getErrorMessage` / `getErrorMessageWithFallback` depuis `@/lib/errors`.
3. **Logs** : Utiliser `log` / `warn` / `error` depuis `@/lib/logger` (ou `logger.js` en .js).
4. **URL / nom du site** : Toujours `BRAND.URL` et `BRAND.NAME`, jamais `process.env.NEXT_PUBLIC_SITE_*` directement.
