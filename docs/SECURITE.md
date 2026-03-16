# Sécurité – TechPlay

Résumé des mesures de sécurité en place et bonnes pratiques.

---

## En place

### Authentification et autorisation

- **NextAuth** : session JWT, cookies `__Secure-*` (HTTPS), `maxAge` 30 jours.
- **Admin** : `requireAdmin()` sur toutes les routes `/api/admin/*`, blog delete/toggle-publish, reviews. Vérification rôle `admin` via session.
- **Compte** : `getSession()` sur wishlist, account/profile, invoice ; pas d’exposition de données sans session.
- **Login** : rate limit (10 tentatives / 10 min par IP), comparaison mot de passe via bcrypt, pas de fuite d’info sur « email ou mot de passe invalide ».

### API sensibles

- **Stripe webhook** : signature vérifiée avec `STRIPE_WEBHOOK_SECRET` ; body lu en `text()` pour la signature, pas de `req.json()` avant vérification.
- **Checkout** : validation Zod (email, address, line items), rate limit (15 req/min en prod), vérification Origin/Referer contre `SITE_URL`.
- **Contact** : validation Zod (email, message, nom, pas de lien dans le message), **rate limit 10 req/min par IP**.
- **Avis (review)** : validation Zod, rate limit 5 req/min, honeypot, reCAPTCHA v3 optionnel (score ≥ 0.4).
- **Cron / Revalidate** : `CRON_SECRET` et `ADMIN_REVALIDATE_TOKEN` vérifiés via **comparaison timing-safe** (`lib/secureCompare.ts`) pour éviter les attaques par timing.

### Données et validation

- **Zod** : schémas pour contact, checkout, blog (admin), review ; messages d’erreur contrôlés.
- **Contact** : `messageSchema` refuse les liens (`https?://`, `www.`) pour limiter le spam.
- **Réponses API** : `apiError()` n’expose pas les détails techniques en production (`apiResponse.ts`).

### En-têtes et CSP

- **next.config.mjs** : HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, COOP/CORP, Permissions-Policy stricte.
- **CSP** : default-src 'self', form-action 'self', object-src 'none', frame-ancestors 'none' ; script-src limité aux domaines analytics (GA, GTM, Meta, Hotjar, Clarity).
- **API** : `Cache-Control: no-store` sur `/api/*`.
- **Powered-By** : désactivé.

### Secrets et env

- **env.server.ts** : validation Zod des variables serveur ; en **production** : `STRIPE_SECRET_KEY` et **NEXTAUTH_SECRET/AUTH_SECRET** (obligatoires, pas de valeur par défaut faible).
- Secrets (Stripe, MongoDB, Brevo, reCAPTCHA, etc.) uniquement côté serveur, jamais en `NEXT_PUBLIC_*` sauf ce qui doit être exposé (clés Stripe publishable, analytics).

### XSS

- **dangerouslySetInnerHTML** utilisé uniquement pour du JSON-LD (schema.org) ou du JSON sérialisé côté serveur, pas d’injection de contenu utilisateur.
- Contenu éditable (blog, avis) affiché via React (échappement par défaut).

### Divers

- **Bcrypt** : rounds configurables (`BCRYPT_ROUNDS`).
- **Invoice** : rate limit, accès réservé à l’utilisateur connecté (session).

---

## Recommandations optionnelles

- **reCAPTCHA sur le formulaire contact** : si spam, ajouter reCAPTCHA v3 comme sur les avis.
- **Middleware** : si besoin de protéger des routes entières (ex. `/admin`) par redirect avant rendu, ajouter un `middleware.ts` à la racine.
- **CSP** : `script-src` contient encore `'unsafe-inline'` / `'unsafe-eval'` pour certains scripts (GTM, etc.) ; à durcir si vous migrez vers des nonces ou hashes.
- **Rate limit global** : actuellement par route (checkout, contact, review, etc.) ; un rate limit global (ex. 200 req/min par IP) peut compléter en cas d’abus.

---

## Checklist déploiement

- [ ] `NEXTAUTH_SECRET` / `AUTH_SECRET` définis et forts (≥ 32 caractères aléatoires).
- [ ] `STRIPE_WEBHOOK_SECRET` configuré et endpoint Stripe en HTTPS.
- [ ] `MONGODB_URI` avec utilisateur dédié et droits minimaux.
- [ ] `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcrypt) pour le compte admin.
- [ ] Pas de secret dans le code ni dans le dépôt ; tout via variables d’environnement.
