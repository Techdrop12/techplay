import { cn } from '@/lib/utils'

export default function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-2xl font-bold tracking-tight sm:text-3xl', className)}>
      {children}
    </h2>
  )
}
