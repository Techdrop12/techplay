export default function PricingBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
      {children}
    </span>
  )
}
