'use client'

import { useState } from 'react'

export default function ImportProductsPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)

  const handleImport = async () => {
    if (!file) {
      setStatus('❌ Aucun fichier sélectionné')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import-products', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setStatus(`✅ ${data.importedCount} produits importés`)
      } else {
        setStatus(`❌ Erreur : ${data.message || 'Import échoué'}`)
      }
    } catch (error) {
      console.error('Erreur import :', error)
      setStatus('❌ Erreur réseau')
    }
  }

  return (
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
  )
}
