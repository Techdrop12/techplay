import Link from 'next/link'

interface CTAProps {
  title: string
  description: string
  href: string
  buttonLabel: string
}

export default function CTA({ title, description, href, buttonLabel }: CTAProps) {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-zinc-100 to-white p-10 dark:from-zinc-900 dark:to-black">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <Link
        href={href}
        className="mt-4 inline-block rounded-lg bg-black px-5 py-2 text-white transition hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      >
        {buttonLabel}
      </Link>
    </div>
  )
}
