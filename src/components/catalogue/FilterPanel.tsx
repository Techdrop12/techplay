'use client'

type Props = {
  categories: string[]
  selected: string | null
  setSelected: (value: string | null) => void
}

export default function FilterPanel({ categories, selected, setSelected }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterButton
        label="Tous"
        active={selected === null}
        onClick={() => setSelected(null)}
      />
      {categories.map((category) => (
        <FilterButton
          key={category}
          label={category}
          active={selected === category}
          onClick={() => setSelected(category)}
        />
      ))}
    </div>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-full border transition focus:outline-none focus:ring-2 focus:ring-brand ${
        active
          ? 'bg-brand text-white'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
      }`}
      aria-pressed={active}
      aria-label={`Filtrer par catégorie : ${label}`}
    >
      {label}
    </button>
  )
}
