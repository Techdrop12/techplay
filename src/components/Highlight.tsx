import { cn } from '@/lib/utils'

export default function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-block bg-yellow-100 px-2 py-1 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100',
        className
      )}
    >
      {children}
    </span>
  )
}
