import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UserSearchProps {
  /** What is in the box right now — changes on every keystroke. */
  query: string
  /** What the filter is actually running on — changes 500 ms after the last one. */
  debouncedQuery: string
  onQueryChange: (query: string) => void
}

/**
 * Stateless, like every other child in this app: the query lives in
 * `UsersPage`, which is also where the filtering happens. This renders the
 * box and, beside it, the two values side by side so the delay is visible
 * rather than something you have to take on faith.
 */
export default function UserSearch({
  query,
  debouncedQuery,
  onQueryChange,
}: UserSearchProps) {
  // Derived during render. While these two disagree there is a timer pending.
  const settling = query !== debouncedQuery

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="user-search">Search the directory</Label>
        <Input
          id="user-search"
          name="user-search"
          type="search"
          placeholder="Type a name quickly and watch the two values disagree"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="min-w-0 rounded-lg border bg-card px-3 py-2">
          <p className="text-xs text-muted-foreground">Raw — every keystroke</p>
          <p className="truncate font-mono text-sm">
            {query === '' ? (
              <span className="text-muted-foreground">(empty)</span>
            ) : (
              `"${query}"`
            )}
          </p>
        </div>

        <div className="min-w-0 rounded-lg border bg-card px-3 py-2">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            Debounced — 500 ms
            {settling && (
              <Badge variant="secondary" className="animate-pulse">
                settling…
              </Badge>
            )}
          </p>
          {/* Announced politely: the value lands after the typing stops, which
              is exactly the moment a screen reader should hear about it. */}
          <p className="truncate font-mono text-sm" aria-live="polite">
            {debouncedQuery === '' ? (
              <span className="text-muted-foreground">(empty)</span>
            ) : (
              `"${debouncedQuery}"`
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
