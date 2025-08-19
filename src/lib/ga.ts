// src/lib/ga.ts
// 📊 Google Analytics v4 – utilitaires robustes (TS), avec file d’attente + DNT + no-ops côté server

// --- Types & globals ---
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

const isBrowser = typeof window !== 'undefined';
const doNotTrack =
  isBrowser &&
  ( // plusieurs variantes selon navigateur
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  );

const GA_ENABLED = !!GA_TRACKING_ID && !doNotTrack;

// Petite file d’attente pour les appels faits avant que gtag soit prêt
const queue: any[][] = [];

function canTrack(): boolean {
  return isBrowser && typeof window.gtag === 'function' && GA_ENABLED;
}

function gtagSafe(...args: any[]) {
  if (canTrack()) {
    window.gtag!(...args);
  } else if (isBrowser && GA_ENABLED) {
    queue.push(args);
    // petit poller pour flush dès que gtag arrive
    startFlushPoller();
  }
}

let pollerStarted = false;
function startFlushPoller() {
  if (pollerStarted || !isBrowser) return;
  pollerStarted = true;
  const id = window.setInterval(() => {
    if (canTrack()) {
      flushQueue();
      window.clearInterval(id);
      pollerStarted = false;
    }
  }, 500);
}

function flushQueue() {
  while (queue.length && canTrack()) {
    const args = queue.shift()!;
    window.gtag!(...args);
  }
}

// --- Pageview ---
export const pageview = (url: string) => {
  if (!GA_ENABLED || !isBrowser) return;
  gtagSafe('config', GA_TRACKING_ID, { page_path: url });
};

// --- Événements standardisés ---
export type GAEventParams = {
  action: string;
  category?: string;
  label?: string;
  value?: number; // ← maintenant optionnel pour éviter les erreurs TS
  nonInteraction?: boolean;
};

export const event = ({
  action,
  category,
  label,
  value,
  nonInteraction,
}: GAEventParams) => {
  if (!GA_ENABLED || !isBrowser) return;

  const params: Record<string, any> = {};
  if (category) params.event_category = category;
  if (label) params.event_label = label;
  if (typeof value === 'number') params.value = Math.round(value);
  if (nonInteraction) params.non_interaction = true;

  gtagSafe('event', action, params);
};

// --- Événements libres (nom + params arbitraires) ---
export const logEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (!GA_ENABLED || !isBrowser) return;
  gtagSafe('event', eventName, eventParams || {});
};

// --- Helpers e-commerce courants (GA4) ---
type AddToCartPayload = {
  currency?: string;
  value?: number;
  items: Array<{
    item_id?: string;
    item_name?: string;
    price?: number;
    quantity?: number;
    item_category?: string;
  }>;
};

export const trackAddToCart = (payload: AddToCartPayload) => {
  if (!GA_ENABLED || !isBrowser) return;
  gtagSafe('event', 'add_to_cart', payload);
};

export const trackViewItem = (payload: AddToCartPayload) => {
  if (!GA_ENABLED || !isBrowser) return;
  gtagSafe('event', 'view_item', payload);
};

// Optionnel : push DataLayer (si tu utilises GTM en parallèle)
export const pushDataLayer = (data: Record<string, unknown>) => {
  if (!isBrowser) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};
