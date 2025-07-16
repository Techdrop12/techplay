import { cn } from '@/lib/utils'

export default function Subtitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('mt-2 text-muted-foreground text-sm sm:text-base', className)}>
      {children}
    </p>
  )
}
