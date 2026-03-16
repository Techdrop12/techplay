# Gestion des erreurs

Conventions pour les erreurs côté API, logger et UI.

## API (routes)

- **Réponses** : utiliser `apiError(message, status)` et `apiSuccess(data)` depuis `@/lib/apiResponse`. Toutes les réponses sensibles ont `Cache-Control: no-store`.
- **Détails** : `apiError(..., { details })` n’envoie `details` qu’en développement ; en production le corps ne contient que `error`.
- **Logs** : avant de logger une erreur, utiliser `safeErrorForLog(err)` pour redacter emails, clés Stripe, tokens.

```ts
import { apiError, apiSuccess, safeErrorForLog } from '@/lib/apiResponse';
import { error as logError } from '@/lib/logger';

// Dans un catch :
logError('[route]', safeErrorForLog(err));
return apiError('Message utilisateur', 500, {
  details: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
});
```

## Logger (`@/lib/logger`)

- **log / warn** : affichés uniquement en développement.
- **error** : en production, seul un message assaini (redaction) est loggé ; pas de stack ni de données sensibles.

## UI (React)

- **Error boundary** : `src/app/error.tsx` affiche un message générique et un bouton « Réessayer ». Utiliser `getErrorMessage(error)` depuis `@/lib/errors` pour le texte affiché.
- **Messages utilisateur** : pas d’exposition de stack ni de détails techniques en production.

## Résumé

| Contexte     | Outil                                 | Règle                                       |
| ------------ | ------------------------------------- | ------------------------------------------- |
| Réponse API  | `apiError` / `apiSuccess`             | Format JSON homogène, pas de détail en prod |
| Log serveur  | `logError` + `safeErrorForLog`        | Toujours assainir avant de logger           |
| Affichage UI | `getErrorMessage` dans error boundary | Message lisible, pas de stack               |
