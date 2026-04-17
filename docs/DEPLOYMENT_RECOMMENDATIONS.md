# Recommandations de déploiement

_À appliquer dans les paramètres de déploiement (ex. Vercel, Netlify, etc.) si pertinent._

## Recommandations générales

1. **Build Multiple Deployments Simultaneously**  
   Activer les builds concurrents (« On-Demand Concurrent Builds ») pour ne pas attendre qu’un build soit en file d’attente.

2. **Builds plus rapides**  
   Passer à une machine de build plus grande (ex. plus de vCPUs / RAM) pour réduire le temps de build (jusqu’à ~40 % selon les plateformes).

3. **Prévenir les décalages frontend / backend**  
   Activer la protection contre les décalages de version (« Skew Protection » ou équivalent) pour garder client et serveur alignés et limiter les conflits de déploiement.

## Paramètres runtime utiles

- **Node.js** : le projet cible **Node 20.x** (voir `engines` dans `package.json`). Configurer la version Node en conséquence (ex. 22.x si proposé et compatible).
- **Priorité des builds production** : laisser activée si l’option existe.
- **Cold Start Prevention** : activer pour les fonctions serverless si vous avez des API routes sensibles à la latence.

## Warnings npm « deprecated » (gérés dans le projet)

- **node-domexception** : remplacé par un stub local via `overrides` dans `package.json` (`file:./patches/node-domexception-native`), plus le script `postinstall` (`scripts/patch-node-domexception.cjs`) en secours. Le warning npm ne devrait plus apparaître après `npm install` avec le `package-lock.json` à jour.
- **jpeg-exif** : dépendance transitive de **pdfkit** (génération PDF / factures). Le package est déprécié et non maintenu ; le warning restera jusqu’à ce que pdfkit propose une alternative. Aucun impact fonctionnel connu pour l’usage actuel (images dans les PDF).
