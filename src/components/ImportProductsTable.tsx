'use client';

import { useState } from 'react';

import type { ChangeEvent } from 'react';

interface ImportResult {
  success?: boolean;
  count?: number;
  error?: string;
}

export default function ImportProductsTable() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/import-products', {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as ImportResult;
    setResult(data);
    setImporting(false);
  };

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-2">Import de produits en masse</h2>
      <input type="file" accept=".json" onChange={handleFile} className="mb-2" />
      <button
        onClick={handleImport}
        disabled={!file || importing}
        className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-4 py-2 rounded-lg hover:opacity-95"
      >
        {importing ? 'Import…' : 'Importer'}
      </button>
      {result && (
        <div className="mt-2 text-sm">
          {result.success
            ? `Import réussi ! ${result.count} produits ajoutés.`
            : `Erreur : ${result.error}`}
        </div>
      )}
    </div>
  );
}
