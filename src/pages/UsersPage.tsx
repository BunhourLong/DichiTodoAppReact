import { useState } from 'react'
import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UserCard from '@/components/users/UserCard'
import UserListSkeleton from '@/components/users/UserListSkeleton'
import { useFetch } from '@/hooks/useFetch'
import { USER_SOURCES, USER_SOURCE_KEYS } from '@/lib/api'
import type { UserSourceKey } from '@/lib/api'
import type { User } from '@/types/user'

export default function UsersPage() {
  const [source, setSource] = useState<UserSourceKey>('all')
  const [attempt, setAttempt] = useState(0)

  const url = USER_SOURCES[source].url

  // The narrowing, in one line: `users` is `User[] | null` and nothing else.
  // Ask for `users.nmae` below and the build fails; the hook never saw a user.
  const { data: users, loading, error } = useFetch<User[]>(url, attempt)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User directory</h1>
        <p className="text-sm text-muted-foreground">
          Live data from jsonplaceholder, read through{' '}
          <code className="font-mono text-xs">useFetch&lt;User[]&gt;</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div
            className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/60 p-1"
            role="group"
            aria-label="Choose a data source"
          >
            {USER_SOURCE_KEYS.map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={source === key ? 'default' : 'ghost'}
                aria-pressed={source === key}
                onClick={() => setSource(key)}
              >
                {USER_SOURCES[key].label}
              </Button>
            ))}
          </div>

          {loading && <UserListSkeleton />}

          {error && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Could not load the directory</AlertTitle>
              <AlertDescription className="space-y-3">
                <span>{error}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAttempt((current) => current + 1)}
                >
                  <RefreshCw data-icon="inline-start" aria-hidden="true" />
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {users && users.length === 0 && (
            <div className="rounded-lg border border-dashed px-3 py-10 text-center">
              <Inbox
                className="mx-auto size-6 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-2 text-sm font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">
                The request succeeded, it just came back empty.
              </p>
            </div>
          )}

          {users && users.length > 0 && (
            <ul className="space-y-2">
              {/* `user` is a `User` here with no cast and no `any` in sight. */}
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
