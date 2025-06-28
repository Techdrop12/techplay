// ✅ /src/lib/utils/onErrorLogger.js (logging des erreurs serveur/app)
export function onErrorLogger(error, context = {}) {
  // Peut être amélioré pour envoyer vers Sentry, Logtail, etc.
  console.error('[AppError]', error, context);
  // Bonus : Ajout d'un tracking si nécessaire
  // if (typeof window !== 'undefined') logEvent('client_error', { error, ...context });
}
