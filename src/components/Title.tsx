import { cn } from '@/lib/utils'

export default function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('heading-section', className)}>
      {children}
    </h2>
  )
}
