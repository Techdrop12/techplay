import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotFound() {
  const t = useTranslations('error')

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center p-6">
      <h1 className="text-4xl font-bold mb-2">{t('404_title')}</h1>
      <p className="text-gray-600 mb-4">{t('404_message')}</p>
      <Link href="/" className="text-blue-600 underline">
        ⬅ {t('back_home') || 'Retour à l’accueil'}
      </Link>
    </div>
  )
}
