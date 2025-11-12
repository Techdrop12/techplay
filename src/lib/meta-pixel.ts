import type { FBQEvent } from "@/types/analytics";

/** Envoie un événement FBQ typé */
export function sendFBQ(evt: FBQEvent): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  (window.fbq as (...args: unknown[]) => void)(...evt as unknown as unknown[]);
}
