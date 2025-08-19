'use client'

import { useCallback, useMemo, useState } from 'react'
import { event } from '@/lib/ga'
import { cn } from '@/lib/utils'

type InvoiceItem = {
  name: string
  price: number
  quantity: number
}

interface InvoiceButtonProps {
  orderId: string
  /** Surcharges facultatives si tu veux passer les données depuis le client.
   * Si non fournis, l’API doit aller chercher depuis la base côté serveur. */
  customerName?: string
  items?: InvoiceItem[]
  total?: number
  className?: string
  label?: string
  variant?: 'link' | 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export default function InvoiceButton({
  orderId,
  customerName,
  items,
  total,
  className,
  label = 'Télécharger la facture',
  variant = 'link',
  size = 'sm',
}: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const payload = useMemo(() => {
    const base: Record<string, unknown> = { orderId }
    if (customerName) base.customerName = customerName
    if (Array.isArray(items)) base.items = items
    if (typeof total === 'number') base.total = total
    return base
  }, [orderId, customerName, items, total])

  const buttonClasses = cn(
    'inline-flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent rounded',
    variant === 'primary' &&
      'bg-accent text-white hover:bg-accent/90 px-3 py-2 font-semibold',
    variant === 'link' &&
      'text-blue-600 underline underline-offset-2 hover:opacity-80',
    variant === 'ghost' &&
      'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 px-3 py-2',
    size === 'sm' && variant !== 'link' && 'text-sm',
    size === 'md' && variant !== 'link' && 'text-base',
    loading && 'opacity-60 cursor-not-allowed',
    className
  )

  const extractFilename = (disposition: string | null, fallback: string) => {
    if (!disposition) return fallback
    // content-disposition: attachment; filename="facture-123.pdf"
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition)
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1])
      } catch {
        return match[1]
      }
    }
    return fallback
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    // iOS / Safari fallback
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Libère l’URL
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const handleDownload = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setErrorMsg(null)

    // GA (optionnel, no-op si pas configuré)
    try {
      event({
        action: 'download_invoice_click',
        category: 'engagement',
        label: orderId,
        value: 1,
      })
    } catch {
      /* ignore */
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000) // 30s

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!res.ok) {
        // essaie de lire l’erreur JSON propre si dispo
        let msg = `Erreur serveur (${res.status})`
        try {
          const j = await res.json()
          if (j?.error) msg = String(j.error)
        } catch {
          /* ignore */
        }
        throw new Error(msg)
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.toLowerCase().includes('pdf')) {
        throw new Error('Réponse inattendue: ce n’est pas un PDF.')
      }

      const blob = await res.blob()
      const suggested = extractFilename(
        res.headers.get('content-disposition'),
        `facture-${orderId}.pdf`
      )
      downloadBlob(blob, suggested)

      // GA succès
      try {
        event({
          action: 'download_invoice_success',
          category: 'engagement',
          label: orderId,
          value: 1,
        })
      } catch {
        /* ignore */
      }
    } catch (err: any) {
      const msg =
        err?.name === 'AbortError'
          ? 'La génération de la facture a expiré. Réessayez.'
          : err?.message || 'Impossible de générer la facture.'
      setErrorMsg(msg)

      // GA erreur
      try {
        event({
          action: 'download_invoice_error',
          category: 'engagement',
          label: orderId,
          value: 1,
        })
      } catch {
        /* ignore */
      }
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [loading, orderId, payload])

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className={buttonClasses}
        aria-busy={loading}
        aria-live="polite"
      >
        {loading ? 'Génération…' : label}
      </button>
      {errorMsg && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
