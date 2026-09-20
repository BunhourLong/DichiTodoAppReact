import { useEffect, useState } from 'react'
import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UserCard from '@/components/users/UserCard'
import UserListSkeleton from '@/components/users/UserListSkeleton'
import { USER_SOURCES } from '@/lib/api'

export default function UsersPage() {
  const [source, setSource] = useState('all')
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('loading')
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)

  const url = USER_SOURCES[source].url

  useEffect(() => {
    // The race guard. Switch sources twice quickly and two requests are in
    // flight at once; whichever answers last would otherwise win and paint
    // the wrong list. The cleanup flips this flag, so a response that belongs
    // to a run we have moved on from is read and thrown away.
    let cancelled = false
    const controller = new AbortController()

    async function loadUsers() {
      setStatus('loading')
      setError(null)

      try {
        const response = await fetch(url, { signal: controller.signal })

        // fetch only rejects on network failure — a 404 is a resolved promise
        // with ok === false, so the error state has to be raised by hand.
        if (!response.ok) {
          throw new Error(`Request failed — ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        if (cancelled) return

        setUsers(data)
        setStatus('success')
      } catch (requestError) {
        if (cancelled || requestError.name === 'AbortError') return

        setError(requestError.message)
        setStatus('error')
      }
    }

    loadUsers()

    return () => {
      cancelled = true
      // abort() stops the request itself; `cancelled` still matters because a
      // response can already be resolving when the cleanup runs.
      controller.abort()
    }
    // Only the two values the effect actually reads.
  }, [url, attempt])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User directory</h1>
        <p className="text-sm text-muted-foreground">
          Live data from jsonplaceholder, with a branch for every outcome.
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
            {Object.entries(USER_SOURCES).map(([key, { label }]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={source === key ? 'default' : 'ghost'}
                aria-pressed={source === key}
                onClick={() => setSource(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {status === 'loading' && <UserListSkeleton />}

          {status === 'error' && (
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

          {status === 'success' && users.length === 0 && (
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

          {status === 'success' && users.length > 0 && (
            <ul className="space-y-2">
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
