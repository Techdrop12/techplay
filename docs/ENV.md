# Variables d'environnement

Référence des variables utilisées par TechPlay. La validation côté serveur est dans `src/env.server.ts` ; les constantes client dans `src/lib/constants.ts`.

## Environnements

| Contexte      | Fichier typique          | STRIPE_SECRET_KEY         |
| ------------- | ------------------------ | ------------------------- |
| Développement | `.env.local`             | Optionnel (checkout mock) |
| CI            | Secrets / `CI_STRIPE_SK` | Placeholder pour build    |
| Production    | Vercel / hôte            | **Requis**                |

En **production**, si `STRIPE_SECRET_KEY` est vide, l’app lève une erreur au démarrage (`env.server.ts`).

## Serveur (secret, jamais exposé)

| Variable                          | Requis (prod)     | Description                                                               |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`               | Oui               | Clé secrète Stripe (sk*live*\*)                                           |
| `STRIPE_WEBHOOK_SECRET`           | Si webhooks       | whsec\_\* pour signature webhook                                          |
| `MONGODB_URI`                     | Si DB             | URI MongoDB (commandes, avis, etc.)                                       |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Si auth           | Secret NextAuth                                                           |
| `CRON_SECRET`                     | Si cron           | Token pour appels cron/revalidate                                         |
| `BREVO_API_KEY`                   | Si emails         | API Brevo (transactionnel, relances panier abandonné)                     |
| `BREVO_SENDER`                    | Si Brevo          | Email expéditeur vérifié                                                  |
| `BREVO_SENDER_NAME`               | Optionnel         | Nom affiché (défaut : TechPlay)                                           |
| `BREVO_ABANDON_TEMPLATE_ID`       | Si relance panier | ID du template Brevo (params : EMAIL, CART_ITEMS, CART_TOTAL, CART_COUNT) |
| `RECAPTCHA_SECRET_KEY`            | Si avis           | reCAPTCHA v3 serveur                                                      |

## Client (NEXT*PUBLIC*\*)

Exposées au navigateur. Ne pas y mettre de secrets.

| Variable                                        | Description                              |
| ----------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                          | URL canonique du site (sans slash final) |
| `NEXT_PUBLIC_SITE_NAME`                         | Nom de la marque                         |
| `NEXT_PUBLIC_LOCALE`                            | Locale par défaut (fr-FR, en-US…)        |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, etc. | Analytics (optionnel)                    |

## Health check

`GET /api/health` retourne `{ status, version, env }` sans donnée sensible. Utilisable pour sonde de vie et monitoring.
