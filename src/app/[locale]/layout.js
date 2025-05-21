import LocaleProvider from '../../../i18n'
import '@/styles/globals.css'
import LayoutWithAnalytics from './LayoutWithAnalytics'
import FreeShippingBadge from '@/components/FreeShippingBadge'

export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          <LayoutWithAnalytics>{children}</LayoutWithAnalytics>
        </LocaleProvider>
        <FreeShippingBadge />
      </body>
    </html>
  )
}
