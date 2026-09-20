import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { initialsOf } from '@/lib/api'

export default function UserCard({ user }) {
  return (
    <li>
      {/* Client-side navigation: no page reload, the header effects keep running. */}
      <Link
        to={`/users/${user.id}`}
        className="flex items-center gap-3 rounded-lg border bg-card px-3 py-3 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Avatar className="size-9">
          <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        <Badge variant="secondary" className="hidden sm:inline-flex">
          @{user.username}
        </Badge>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </Link>
    </li>
  )
}
