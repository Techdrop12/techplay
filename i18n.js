// 📁 /i18n.js
import { NextIntlProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { useMessages } from 'next-intl'

export default function LocaleProvider({ children, locale }) {
  const messages = useMessages()
  if (!messages) notFound()

  return (
    <NextIntlProvider locale={locale} messages={messages}>
      {children}
    </NextIntlProvider>
  )
}
