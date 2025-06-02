// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export default getRequestConfig(async ({ locale }) => {
  if (!['fr', 'en'].includes(locale)) notFound()

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
