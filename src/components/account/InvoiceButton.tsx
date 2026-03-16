'use client';

import { useCallback, useMemo, useState } from 'react';

import { getErrorMessage } from '@/lib/errors';
import { event } from '@/lib/ga';
import { cn } from '@/lib/utils';

type InvoiceItem = {
  name: string;
  price: number;
  quantity: number;
};

interface InvoiceButtonProps {
  orderId: string;
  customerName?: string;
  items?: InvoiceItem[];
  total?: number;
  className?: string;
  label?: string;
  variant?: 'link' | 'primary' | 'ghost';
  size?: 'sm' | 'md';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getInvoiceErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === 'AbortError') {
    return 'La génération de la facture a expiré. Réessayez.';
  }
  if (isRecord(error) && (error as { name?: string }).name === 'AbortError') {
    return 'La génération de la facture a expiré. Réessayez.';
  }
  return getErrorMessage(error) || 'Impossible de générer la facture.';
}

function extractFilename(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const classicMatch = /filename="?([^"]+)"?/i.exec(disposition);
  if (classicMatch?.[1]) return classicMatch[1];

  return fallback;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  a.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const payload = useMemo(() => {
    const base: Record<string, unknown> = { orderId };

    if (customerName) base.customerName = customerName;
    if (Array.isArray(items)) base.items = items;
    if (typeof total === 'number') base.total = total;

    return base;
  }, [orderId, customerName, items, total]);

  const buttonClasses = cn(
    'inline-flex items-center justify-center rounded transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    variant === 'primary' && 'bg-accent px-3 py-2 font-semibold text-white hover:bg-accent/90',
    variant === 'link' && 'text-[hsl(var(--accent))] underline underline-offset-2 hover:opacity-80',
    variant === 'ghost' && 'px-3 py-2 text-token-text/80 hover:bg-[hsl(var(--surface-2))]',
    size === 'sm' && variant !== 'link' && 'text-sm',
    size === 'md' && variant !== 'link' && 'text-base',
    loading && 'cursor-not-allowed opacity-60',
    className
  );

  const handleDownload = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      event({
        action: 'download_invoice_click',
        category: 'engagement',
        label: orderId,
        value: 1,
      });
    } catch {}

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch('/api/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = `Erreur serveur (${res.status})`;

        try {
          const json: unknown = await res.json();
          if (isRecord(json) && typeof json.error === 'string' && json.error.trim()) {
            message = json.error;
          }
        } catch {}

        throw new Error(message);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('pdf')) {
        throw new Error('Réponse inattendue : ce n’est pas un PDF.');
      }

      const blob = await res.blob();
      const filename = extractFilename(
        res.headers.get('content-disposition'),
        `facture-${orderId}.pdf`
      );

      downloadBlob(blob, filename);

      try {
        event({
          action: 'download_invoice_success',
          category: 'engagement',
          label: orderId,
          value: 1,
        });
      } catch {}
    } catch (error: unknown) {
      const message = getInvoiceErrorMessage(error);
      setErrorMsg(message);

      try {
        event({
          action: 'download_invoice_error',
          category: 'engagement',
          label: orderId,
          value: 1,
        });
      } catch {}
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [loading, orderId, payload]);

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
  );
}
