import { Skeleton } from '@/components/ui/skeleton'

/** The loading state: same shape as a real row, so nothing jumps on arrival. */
export default function UserListSkeleton({ rows = 5 }) {
  return (
    <ul className="space-y-2" aria-busy="true" aria-label="Loading users">
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-lg border bg-card px-3 py-3"
        >
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </li>
      ))}
    </ul>
  )
}
