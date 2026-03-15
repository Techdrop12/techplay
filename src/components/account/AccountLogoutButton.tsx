'use client'

import { signOut } from 'next-auth/react'

type Props = {
  className?: string
  children?: React.ReactNode
}

export default function AccountLogoutButton({ className = '', children }: Props) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/account' })}
      className={className}
      aria-label="Se déconnecter"
    >
      {children ?? 'Se déconnecter'}
    </button>
  )
}
