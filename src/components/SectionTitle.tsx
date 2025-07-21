type Props = {
  title: string
  subtitle?: string
}

export default function SectionTitle({ title, subtitle }: Props) {
  return (
    <header className="text-center mt-16 mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  )
}
