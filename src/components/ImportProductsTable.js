// ✅ src/components/ImportProductsTable.js

'use client';

import { useState } from 'react';

export default function ImportProductsTable() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async () => {
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/import-products', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
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
        className="bg-blue-600 text-white px-4 py-2 rounded"
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
