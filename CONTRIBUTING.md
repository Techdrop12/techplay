# Contribuer à TechPlay

## Prérequis

- Node.js **>= 20.9** (voir `engines` dans `package.json`)
- npm **>= 10**

## Installation

```bash
git clone <repo>
cd TechPlay_FINAL_DELIVERY
npm ci
cp .env.example .env.local
# Éditer .env.local avec les valeurs de dev (STRIPE optionnel en local)
```

## Scripts et quality gates

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Démarrer le build (port 3000) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | ESLint (max-warnings=0) |
| `npm run test` | Tests Vitest |
| **`npm run ci`** | **Typecheck + lint + test + build** (même enchaînement que la CI) |
| `npm run test:e2e` | Tests E2E Playwright (parcours critique). Démarrer le serveur avant ou laisser le config le lancer en dev. |
| `npm run test:e2e:ui` | Mode UI Playwright pour déboguer les E2E. |

Avant de pousser ou d’ouvrir une PR, exécuter au minimum :

```bash
npm run ci
```

La CI (`.github/workflows/ci.yml`) exécute les mêmes étapes sur chaque push et chaque pull request. Le déploiement (`.github/workflows/deploy.yml`) ne s’exécute que sur `main` après passage des quality gates.

## Conventions

- **Types** : TypeScript strict, pas de `any` non justifié.
- **Lint** : pas de warning (0 max). Utiliser `npm run lint:fix` pour les corrections automatiques.
- **Tests** : nouveaux comportements critiques couverts par des tests (helpers, routes API sensibles). Fichiers sous `tests/`.
- **Erreurs** : côté API utiliser `apiError` / `apiSuccess` et `safeErrorForLog` pour les logs (voir `docs/ERROR_HANDLING.md`).
- **Env** : variables documentées dans `.env.example` et `docs/ENV.md`.
- **Devise** : utiliser `detectCurrency(locale?)` depuis `@/lib/currency` (une seule source de vérité).
- **Analytics** : noms de listes et étapes funnel depuis `@/lib/analytics-events` (`LIST_NAMES`, `FUNNEL_STEPS`, `BUSINESS_EVENTS`).

## Environnements

- **Développement** : `.env.local`, Stripe optionnel (checkout mock si clé absente).
- **CI** : build avec `NODE_ENV=production` et `STRIPE_SECRET_KEY` placeholder (secret `CI_STRIPE_SK` optionnel).
- **Production** : `STRIPE_SECRET_KEY` obligatoire ; autres variables selon les features (DB, auth, Brevo, etc.).

## Documentation technique

- `docs/ENV.md` — Variables d’environnement
- `docs/ERROR_HANDLING.md` — Gestion des erreurs (API, logger, UI)
- `docs/RUNBOOK.md` — Opérations et monitoring
