// File: src/app/[locale]/admin/importer/page.js
'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import SEOHead from '@/components/SEOHead';

export default function ImportProductsPage() {
  const t = useTranslations('admin');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  const handleImport = async () => {
    if (!file) {
      setStatus('❌ Aucun fichier sélectionné');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import-products', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus(`✅ ${data.importedCount} produits importés`);
      } else {
        setStatus(`❌ Erreur : ${data.message || 'Import échoué'}`);
      }
    } catch (error) {
      console.error('Erreur import :', error);
      setStatus('❌ Erreur réseau');
    }
  };

  return (
    <>
      <SEOHead
        overrideTitle={t('dashboard')}
        overrideDescription="Importer des produits via CSV"
      />
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Importer produits via CSV</h1>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 block"
        />
        <button
          onClick={handleImport}
          disabled={!file}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Importer
        </button>
        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </>
  );
}
