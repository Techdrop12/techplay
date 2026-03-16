// Optional dependencies: declare when not installed so typecheck passes.
declare module 'firebase/app' {
  export function initializeApp(config: Record<string, unknown>): unknown;
  export function getApps(): unknown[];
}
declare module 'firebase/messaging' {
  export function getMessaging(app: unknown): unknown;
  export function getToken(messaging: unknown, options: { vapidKey?: string }): Promise<string>;
  export function onMessage(messaging: unknown, handler: (payload: unknown) => void): () => void;
}
declare module 'canvas' {
  export function createCanvas(
    width: number,
    height: number
  ): {
    getContext(contextId: '2d'): unknown;
    toBuffer(mime: string): Buffer;
  };
  export function loadImage(src: string): Promise<{ width: number; height: number }>;
}
declare module '@sanity/client' {
  export interface SanityClient {
    fetch<T>(
      query: string,
      params?: Record<string, unknown>,
      options?: { next?: { revalidate?: number } }
    ): Promise<T>;
  }
  export function createClient(config: {
    projectId?: string;
    dataset?: string;
    apiVersion?: string;
    useCdn?: boolean;
    token?: string;
  }): SanityClient;
  export type { SanityClient };
}
declare module '@formkit/auto-animate/react' {
  import type { RefObject } from 'react';
  export function useAutoAnimate<T extends HTMLElement>(): [
    RefObject<T | null>,
    (el: T | null) => void,
  ];
}
