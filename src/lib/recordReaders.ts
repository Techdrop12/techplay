export type AnyRecord = Record<string, unknown>;

export function readString(record: AnyRecord, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

export function readNumber(record: AnyRecord, keys: readonly string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    const parsed =
      typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : NaN;

    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function readBoolean(record: AnyRecord, keys: readonly string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
  }
  return undefined;
}
