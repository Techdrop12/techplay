'use client'
import { useTranslations } from 'next-intl'

export default function AdminDashboard() {
  const t = useTranslations('admin')

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{t('dashboard')}</h1>
      <ul className="list-disc ml-6">
        <li>{t('total_sales')}: €XXXX</li>
        <li>{t('total_orders')}: XX</li>
        <li>{t('latest_order')}: #12345</li>
      </ul>
    </div>
  )
}
