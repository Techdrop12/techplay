// Global window augmentations for analytics, pixels, PWA helpers, etc.
export {};

declare global {
  // ---- Google gtag() ----
  namespace Gtag {
    interface Config {
      page_title?: string;
      page_location?: string;
      page_path?: string;
      anonymize_ip?: boolean;
      allow_ad_personalization_signals?: boolean;
      send_page_view?: boolean;
      [key: string]: unknown;
    }

    interface EventParams {
      event_category?: string;
      event_label?: string;
      value?: number;
      non_interaction?: boolean;
      [key: string]: unknown;
    }
  }

  interface Window {
    /** Google Tag global data layer (gtag.js) */
    dataLayer: unknown[];
    /**
     * Strictly typed gtag signature:
     *  - gtag('js', new Date())
     *  - gtag('config', 'G-XXXX', { ... })
     *  - gtag('event', 'event_name', { ... })
     */
    gtag: (
      ...args:
        | ['js', Date]
        | ['config', string, Gtag.Config?]
        | ['event', string, Gtag.EventParams?]
    ) => void;

    /** Meta/Facebook Pixel */
    fbq?: (
      ...args:
        | ['init', string]
        | ['track', string, Record<string, unknown>?]
        | ['consent', 'revoke' | 'grant']
    ) => void;

    /** Hotjar */
    hj?: (method: 'trigger' | 'identify' | 'stateChange', value: unknown) => void;

    /** Workbox (PWA) – if you register service worker with workbox-window */
    workbox?: {
      messageSW: (data: unknown) => Promise<void>;
      register: () => Promise<void>;
      active?: ServiceWorker;
    };
  }
}
