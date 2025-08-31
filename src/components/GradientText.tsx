import { cn } from '@/lib/utils'

export default function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent',
        className
      )}
    >
      {children}
    </span>
  )
}
