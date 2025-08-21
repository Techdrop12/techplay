// src/types/shipping-simulator.d.ts
declare module '@/components/ShippingSimulator' {
  import * as React from 'react'

  export interface ShippingSimulatorProps {
    minDays?: number
    maxDays?: number
    businessDaysOnly?: boolean
    cutoffHourLocal?: number
    holidays?: string[]                 // ex: ['2025-12-25','2026-01-01']
    varianceExtraDays?: number
    productKey?: string                 // id/slug; fallback pathname
    showDates?: boolean
    locale?: string                     // ex: 'fr-FR'
    timeZone?: string                   // ex: 'Europe/Paris'
    persist?: 'local' | 'session'
    className?: string
    icon?: React.ReactNode              // '🚚' par défaut
  }

  const ShippingSimulator: React.FC<ShippingSimulatorProps>
  export default ShippingSimulator
}
