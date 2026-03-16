import { error as logError } from '@/lib/logger';

export function onErrorLogger(err: unknown, context: Record<string, unknown> = {}): void {
  const payload = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    ...context,
    at: new Date().toISOString(),
  };

  logError('[AppError]', payload);
}
