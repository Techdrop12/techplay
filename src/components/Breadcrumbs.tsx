// components/Breadcrumbs.tsx
import Link from "next/link"

interface BreadcrumbLink {
  href?: string
  label: string
}

export default function Breadcrumbs({ links }: { links: BreadcrumbLink[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4 space-x-1">
      {links.map((link, index) => (
        <span key={index}>
          {index > 0 && " / "}
          {link.href ? (
            <Link href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ) : (
            <span className="text-gray-700">{link.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
