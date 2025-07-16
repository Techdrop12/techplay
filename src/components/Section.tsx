import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLElement> {
  id?: string
}

export default function Section({ className = '', id, ...props }: Props) {
  return (
    <section id={id} className={cn('py-16 lg:py-24', className)} {...props} />
  )
}
