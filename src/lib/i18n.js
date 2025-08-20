import { NextIntlProvider } from 'next-intl'

async function loadMessages(locale) {
  try {
    const mod = await import(`../messages/${locale}.json`)
    return mod.default || mod
  } catch {
    const mod = await import('../messages/fr.json')
    return mod.default || mod
  }
}

export async function getI18nProps(locale) {
  const messages = await loadMessages(locale)
  return { locale, messages }
}

export function withI18n(Component) {
  return function Wrapper(props) {
    const { locale, messages } = props
    return (
      <NextIntlProvider locale={locale} messages={messages}>
        <Component {...props} />
      </NextIntlProvider>
    )
  }
}
