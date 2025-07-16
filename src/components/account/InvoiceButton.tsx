'use client'

export default function InvoiceButton({ orderId }: { orderId: string }) {
  const handleDownload = async () => {
    const res = await fetch('/api/invoice', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        customerName: 'Client Test',
        items: [{ name: 'Produit A', price: 20, quantity: 2 }],
        total: 40,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `facture-${orderId}.pdf`
    link.click()
  }

  return (
    <button onClick={handleDownload} className="text-sm text-blue-600 underline">
      Télécharger la facture
    </button>
  )
}
