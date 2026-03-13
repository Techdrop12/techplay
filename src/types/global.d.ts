// src/types/global.d.ts
export {}

declare global {
  namespace Gtag {
    interface Config {
      page_title?: string
      page_location?: string
      page_path?: string
      anonymize_ip?: boolean
      allow_ad_personalization_signals?: boolean
      allow_google_signals?: boolean
      send_page_view?: boolean
      [key: string]: unknown
    }

    interface EventParams {
      event_category?: string
      event_label?: string
      value?: number
      non_interaction?: boolean
      currency?: string
      items?: Record<string, unknown>[]
      debug_mode?: boolean
      [key: string]: unknown
    }

    type ConsentValue = 'granted' | 'denied'

    interface ConsentUpdate {
      ad_storage?: ConsentValue
      analytics_storage?: ConsentValue
      ad_user_data?: ConsentValue
      ad_personalization?: ConsentValue
      functionality_storage?: ConsentValue
      security_storage?: ConsentValue
      wait_for_update?: number
      [key: string]: unknown
    }

    type Command =
      | ['js', Date]
      | ['config', string, Config?]
      | ['event', string, EventParams?]
      | ['consent', 'default' | 'update', ConsentUpdate]
      | ['set', Record<string, unknown>]
      | ['set', 'user_properties', Record<string, unknown>]
      | ['get', string, string, (value: unknown) => void]
  }

  type DataLayerEntry = Record<string, unknown> | Gtag.Command

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms?: string[]
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
  }

  interface IdleDeadline {
    readonly didTimeout: boolean
    timeRemaining: () => number
  }

  interface IdleRequestOptions {
    timeout?: number
  }

  interface NetworkInformation {
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
    downlink?: number
    rtt?: number
    saveData?: boolean
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }

  interface Window {
    dataLayer?: DataLayerEntry[]

    gtag?: (...args: Gtag.Command) => void

    fbq?: (
      ...args:
        | ['init', string]
        | ['track', string, Record<string, unknown>?]
        | ['consent', 'revoke' | 'grant']
    ) => void

    hj?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void

    workbox?: {
      messageSW: (data: unknown) => Promise<void>
      register: () => Promise<void>
      active?: ServiceWorker | null
    }

    __TP_INSTALL_SEEN?: boolean
    __ga_inited?: boolean
    __ga_consent_default?: boolean

    __consentState?: Gtag.ConsentUpdate
    __applyConsent?: (next: Partial<Gtag.ConsentUpdate> | Record<string, unknown>) => void

    tpOpenConsent?: () => void
    tpResetConsent?: () => void
    tpConsentUpdate?: (p: {
      analytics?: boolean
      ads?: boolean
      ad_user_data?: boolean
      ad_personalization?: boolean
      functionality?: boolean
    }) => void

    __prevOverflow?: string
    __pixelUser?: Record<string, unknown> | null
    tpAskPush?: () => void

    doNotTrack?: string
    opera?: string

    requestIdleCallback?: (
      callback: (deadline: IdleDeadline) => void,
      options?: IdleRequestOptions
    ) => number

    cancelIdleCallback?: (handle: number) => void
  }

  interface Navigator {
    userLanguage?: string
    doNotTrack?: string
    msDoNotTrack?: string
    standalone?: boolean
    connection?: NetworkInformation
  }

  interface HTMLElement {
    inert?: boolean
  }

  interface HTMLBodyElement {
    __prevOverflow?: string
  }
}