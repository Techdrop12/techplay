import type { ReactNode } from 'react';

export default function SectionWrapper({ children }: { children: ReactNode }) {
  return (
    <section className="container-app mx-auto py-10 sm:py-12" role="region">
      {children}
    </section>
  );
}
