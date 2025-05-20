'use client'

export default function AvisBlock({ productId }) {
  const avis = [
    { name: "Sophie", text: "Produit conforme, livraison rapide !" },
    { name: "Marc", text: "Très satisfait, je recommande !" },
    { name: "Julie", text: "Parfait pour offrir, très bon rapport qualité/prix." }
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Avis clients</h2>
      <div className="space-y-3">
        {avis.map((item, i) => (
          <div key={i} className="bg-gray-100 p-3 rounded-md">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-700 italic">"{item.text}"</p>
          </div>
        ))}
      </div>
    </div>
  )
}
