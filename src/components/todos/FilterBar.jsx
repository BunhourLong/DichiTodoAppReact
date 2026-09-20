import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

/**
 * Holds no state at all. The active filter arrives as a prop and every click
 * is reported up — which is why "Clear completed" can live here while the
 * array it clears lives in TodosPage.
 */
export default function FilterBar({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center gap-1 rounded-xl bg-muted/60 p-1"
        role="group"
        aria-label="Filter todos"
      >
        {FILTERS.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={filter === value ? 'default' : 'ghost'}
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <span className="text-sm text-muted-foreground">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </span>

      <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="ml-auto sm:ml-0"
        disabled={completedCount === 0}
        onClick={onClearCompleted}
      >
        <CheckCheck data-icon="inline-start" aria-hidden="true" />
        Clear completed
        {completedCount > 0 && ` (${completedCount})`}
      </Button>
    </div>
  )
}
