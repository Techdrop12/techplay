'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import TableSkeleton from '@/components/admin/TableSkeleton'

interface Submission {
  _id: string
  name?: string
  email: string
  message: string
  consent?: boolean
  createdAt?: string
}

export default function ContactSubmissionsTable() {
  const t = useTranslations('admin')
  const [list, setList] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/contact-submissions')
      .then((res) => res.json())
      .then((data: unknown) => setList(Array.isArray(data) ? data : []))
      .catch(() => toast.error(t('error_load_contact')))
      .finally(() => setLoading(false))
  }, [t])

  if (loading) {
    return <TableSkeleton rows={6} cols={4} ariaLabel={t('loading_contact')} />
  }

  if (list.length === 0) {
    return (
      <p className="p-6 text-token-text/60">
        {t('no_contact')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full text-sm border-collapse" aria-label="Messages contact">
        <thead>
          <tr className="bg-[hsl(var(--surface-2))] text-left">
            <th className="px-4 py-2 border-b border-[hsl(var(--border))]">{t('contact_date')}</th>
            <th className="px-4 py-2 border-b border-[hsl(var(--border))]">{t('contact_name')}</th>
            <th className="px-4 py-2 border-b border-[hsl(var(--border))]">{t('contact_email')}</th>
            <th className="px-4 py-2 border-b border-[hsl(var(--border))]">{t('contact_message')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((row) => (
            <tr
              key={row._id}
              className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
            >
              <td className="px-4 py-2 text-token-text/70">
                {row.createdAt ? new Date(row.createdAt).toLocaleString('fr-FR') : '—'}
              </td>
              <td className="px-4 py-2">{row.name || '—'}</td>
              <td className="px-4 py-2">
                <a
                  href={`mailto:${row.email}`}
                  className="text-[hsl(var(--accent))] hover:underline"
                >
                  {row.email}
                </a>
              </td>
              <td className="px-4 py-2 max-w-md truncate" title={row.message}>
                {row.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
