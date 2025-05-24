'use client'

import LocaleProvider from '../../../i18n'
import '@styles/globals.css'
import LayoutWithAnalytics from './LayoutWithAnalytics'
import FreeShippingBadge from '@/components/FreeShippingBadge'
import AnalyticsScripts from '@/components/AnalyticsScripts'
import ExitPopup from '@/components/ExitPopup'
import EmailCapturePopup from '@/components/EmailCapturePopup'
import useHotjar from '@/lib/hotjar'

export default function LocaleLayout({ children, params: { locale } }) {
  useHotjar()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-black dark:bg-zinc-900 dark:text-white">
        <LocaleProvider locale={locale}>
          <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
        </LocaleProvider>
        <AnalyticsScripts />
        <FreeShippingBadge />
        <ExitPopup />
        <EmailCapturePopup />
      </body>
    </html>
  )
}
