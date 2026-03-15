'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { ChangeEvent } from 'react'

interface ImportResult {
  success?: boolean
  count?: number
  error?: string
}

export default function ImportProductsTable() {
  const t = useTranslations('admin')
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f ?? null)
    setResult(null)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/import-products', {
      method: 'POST',
      body: formData,
    })
    const data = (await res.json()) as ImportResult
    setResult(data)
    setImporting(false)
  }

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-2 text-[hsl(var(--text))]">{t('import_title')}</h2>
      <label htmlFor="import-file" className="block text-sm font-medium text-[hsl(var(--text))] mb-1">
        {t('import_file_label')}
      </label>
      <input
        id="import-file"
        type="file"
        accept=".json"
        onChange={handleFile}
        className="mb-3 block w-full max-w-xs text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-[hsl(var(--accent))] file:px-3 file:py-1.5 file:text-[hsl(var(--accent-fg))]"
        aria-describedby={result ? 'import-result' : undefined}
      />
      <button
        type="button"
        onClick={handleImport}
        disabled={!file || importing}
        aria-busy={importing}
        aria-label={importing ? t('import_importing') : t('import_button')}
        className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-4 py-2 rounded-lg hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] disabled:opacity-60"
      >
        {importing ? t('import_importing') : t('import_button')}
      </button>
      {result && (
        <div id="import-result" className="mt-3 text-sm" role="status">
          {result.success
            ? <span className="text-green-600 dark:text-green-400">{t('import_success', { count: result.count ?? 0 })}</span>
            : <span className="text-red-600 dark:text-red-400">{t('import_error', { error: result.error ?? '' })}</span>
          }
        </div>
      )}
    </div>
  )
}
