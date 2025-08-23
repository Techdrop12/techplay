// src/context/wishlist.tsx — compat shim : plus de vrai contexte nécessaire
'use client'

import type React from 'react'

// On ré-exporte directement le hook et ses types depuis la source canonique
export { useWishlist } from '@/hooks/useWishlist'
export type { UseWishlistReturn, WishlistItemBase } from '@/hooks/useWishlist'

// Ancien <WishlistProvider> devient un no-op : il ne fait que rendre {children}
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
