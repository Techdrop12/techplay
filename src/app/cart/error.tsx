'use client'
export default function Error({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-2xl font-semibold mb-2">Oups, le panier a rencontré un problème</h1>
      <p className="opacity-70 text-sm">{error?.message}</p>
      <p className="mt-4">Réessayez ou videz le panier si le problème persiste.</p>
    </div>
  )
}
