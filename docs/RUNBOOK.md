# Runbook – Opérations et monitoring

## Health check

- **Endpoint** : `GET /api/health`
- **Réponse** : `200` + JSON `{ status, version, env }` (aucune donnée sensible)
- **Usage** : sondes de vie (load balancer, Kubernetes, Vercel), monitoring externe

En cas de 5xx ou timeout sur `/api/health`, considérer l’instance comme indisponible.

## Logs

- **Développement** : `log`, `warn`, `error` de `@/lib/logger` visibles en console.
- **Production** : seuls les appels à `error(...)` sont émis, avec message **assaini** (redaction emails, clés API, tokens). Pas de stack ni de détail brut dans les logs prod.
- Toujours utiliser `safeErrorForLog(err)` avant de passer une erreur au logger (voir `docs/ERROR_HANDLING.md`).

## Déploiement

- **CI** : à chaque push / PR, workflow `ci.yml` exécute typecheck, lint, tests, build.
- **CD** : sur push sur `main`, workflow `deploy.yml` exécute les mêmes gates puis déploie vers Vercel (secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
- Build production exige `STRIPE_SECRET_KEY` non vide ; en CI un placeholder est fourni via secret `CI_STRIPE_SK` ou valeur par défaut.

## En cas d’incident

1. Vérifier `/api/health` et les logs (Vercel / hôte).
2. Vérifier les variables d’environnement (prod) : `STRIPE_SECRET_KEY`, `MONGODB_URI` si utilisé, etc. (cf. `docs/ENV.md`).
3. Erreurs Stripe / webhook : vérifier `STRIPE_WEBHOOK_SECRET` et les logs assainis (pas de clé exposée).
4. Rollback : via l’historique des déploiements Vercel ou restauration d’un commit précédent puis redéploiement.

## Recette avant mise en production

À valider en desktop et mobile (Chrome, Safari, Firefox) :

1. **Tunnel panier** : Ajout au panier → page panier (lien « Passer commande ») → page commande avec formulaire.
2. **Commande** : Panier vide sur `/commande` affiche « Votre panier est vide » et CTAs (pas de formulaire). Formulaire : email + adresse valides, honeypot vide, bouton « Payer maintenant » désactivé pendant le chargement, redirection Stripe.
3. **Succès** : Retour Stripe vers `/commande/success?session_id=...` : message de remerciement, référence courte lisible, boutons « Continuer mes achats » et « Voir mes commandes » (zone tactile ≥ 48px).
4. **Limite 429** : Après trop de tentatives checkout, message explicite « Trop de tentatives. Réessayez dans une minute. »
5. **Sécurité** : Health check sans donnée sensible ; checkout rate limité et vérification Origin ; pas de fuite de clés dans les réponses API.
6. **SEO** : `robots.txt` et sitemap dynamiques (voir `src/app/robots.ts`, `NEXT_PUBLIC_SITE_URL`). Pages panier/commande/succès en noindex.

## Cron

Les tâches planifiées sont définies dans `src/lib/cron.ts` et invoquées via l’endpoint protégé par `CRON_SECRET` (ex. `GET /api/cron/publish-blog` selon la config). Par défaut :

- **publishScheduledArticles** : stub ; à brancher sur la logique de publication d’articles programmés.
- **sendAbandonedCartReminders** : les relances panier abandonné sont gérées côté client (AbandonCartTracker) et par l’API `POST /api/brevo/abandon-panier` (Brevo).
- **cleanupOldSessions** : stub ; à brancher sur nettoyage DB / cache / notifications si besoin.
