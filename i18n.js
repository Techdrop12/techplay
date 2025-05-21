// 📁 i18n.js

import { NextIntlClientProvider, useMessages } from 'next-intl'
import { notFound } from 'next/navigation'

export default function LocaleProvider({ children, locale }) {
  const messages = useMessages()

  if (!messages) notFound()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
