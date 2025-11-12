// src/types/externals.d.ts
export {}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
    hj?: (...args: any[]) => void
    _hjSettings?: { hjid: number; hjsv: number }
    tpConsentUpdate?: (p: {
      analytics?: boolean
      ads?: boolean
      ad_user_data?: boolean
      ad_personalization?: boolean
      functionality?: boolean
    }) => void
  }
}
