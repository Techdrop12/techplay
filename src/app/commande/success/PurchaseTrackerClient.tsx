'use client'

import dynamic from 'next/dynamic'

const PurchaseTracker = dynamic(
  () => import('@/components/checkout/PurchaseTracker'),
  { ssr: false } // autorisé ici car on est dans une Client Component
)

export default function PurchaseTrackerClient(props: {
  sessionId?: string
  mock?: boolean
}) {
  // Rends le tracker uniquement si on a quelque chose d’utile à suivre
  if (!props.sessionId && !props.mock) return null
  return <PurchaseTracker {...props} />
}
