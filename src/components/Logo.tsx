import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
      <img src="/logo.svg" alt="TechPlay logo" className="h-6 dark:hidden" />
      <img src="/logo-dark.svg" alt="TechPlay logo dark" className="h-6 hidden dark:block" />
    </Link>
  )
}
