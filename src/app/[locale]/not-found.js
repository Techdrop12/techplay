import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('error')

  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold">{t('404_title')}</h1>
      <p className="mt-2">{t('404_message')}</p>
    </div>
  )
}
