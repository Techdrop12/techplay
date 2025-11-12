export function plain<T>(x: T): T {
  try { return JSON.parse(JSON.stringify(x)) as T } catch { return x as T }
}
