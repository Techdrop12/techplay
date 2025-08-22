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
      allow_google_signals?: boolean;
      send_page_view?: boolean;
      [key: string]: unknown;
    }

    interface EventParams {
      event_category?: string;
      event_label?: string;
      value?: number;
      non_interaction?: boolean;
      debug_mode?: boolean;
      [key: string]: unknown;
    }

    type ConsentValue = 'granted' | 'denied';
    interface ConsentUpdate {
      ad_storage?: ConsentValue;
      analytics_storage?: ConsentValue;
      ad_user_data?: ConsentValue;
      ad_personalization?: ConsentValue;
      wait_for_update?: number;
      [key: string]: unknown;
    }
  }

  interface Window {
    /** Google Tag global data layer (gtag.js) */
    dataLayer: unknown[];

    /**
     * gtag signatures supportées par ton code:
     *  - 'js', Date
     *  - 'config', id, Config?
     *  - 'event', name, EventParams?
     *  - 'consent', 'default'|'update', ConsentUpdate
     *  - 'set', { ... }  (ex: { user_id })
     *  - 'set', 'user_properties', { ... }
     *  - 'get', id, field, callback
     */
    gtag: (
      ...args:
        | ['js', Date]
        | ['config', string, Gtag.Config?]
        | ['event', string, Gtag.EventParams?]
        | ['consent', 'default' | 'update', Gtag.ConsentUpdate]
        | ['set', Record<string, unknown>]
        | ['set', 'user_properties', Record<string, unknown>]
        | ['get', string, string, (value: unknown) => void]
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

    /** Workbox (PWA) – si tu utilises workbox-window */
    workbox?: {
      messageSW: (data: unknown) => Promise<void>;
      register: () => Promise<void>;
      active?: ServiceWorker;
    };

    /** Flags internes (utilisés dans ton code) */
    __TP_INSTALL_SEEN?: boolean;
    __ga_inited?: boolean;
    __ga_consent_default?: boolean;
  }
}
