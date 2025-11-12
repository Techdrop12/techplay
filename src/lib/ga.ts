import { GAEvent } from "@/types/analytics";

export function sendGA(event: GAEvent): void {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!g) return;
  g("event", event.name, event.params as Record<string, unknown>);
}

export function dlPush<T extends Record<string, unknown>>(obj: T): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(obj);
}
