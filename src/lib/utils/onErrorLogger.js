// src/lib/utils/onErrorLogger.js
export function onErrorLogger(error, context = {}) {
  const payload = {
    message: error?.message || String(error),
    stack: error?.stack,
    ...context,
    at: new Date().toISOString(),
  };

  // Console locale
  // eslint-disable-next-line no-console
  console.error('[AppError]', payload);

  // Hook d'intégration possible :
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) Sentry.captureException(error, { extra: context });
}
