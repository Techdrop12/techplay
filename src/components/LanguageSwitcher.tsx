'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (locale: string) => {
    const newPath = pathname.replace(/^\/(fr|en)/, `/${locale}`)
    router.push(newPath)
  }

  return (
    <div className="flex gap-2 text-sm">
      <button onClick={() => switchLocale('fr')}>🇫🇷</button>
      <button onClick={() => switchLocale('en')}>🇬🇧</button>
    </div>
  )
}
