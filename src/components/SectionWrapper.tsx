import type { ReactNode } from 'react'

export default function SectionWrapper({ children }: { children: ReactNode }) {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      role="region"
    >
      {children}
    </section>
  )
}
