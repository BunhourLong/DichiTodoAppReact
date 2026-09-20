import { Link, useLocation } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** The catch-all: `path="*"` in App.tsx sends every unmatched URL here. */
export default function NotFoundPage() {
  const { pathname } = useLocation()

  return (
    <div className="rounded-xl border border-dashed px-6 py-16 text-center">
      <Compass className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-4 text-4xl font-semibold tracking-tight">404</p>
      <h1 className="mt-1 text-lg font-medium">This route does not exist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Nothing is registered for <code className="font-mono">{pathname}</code>.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button asChild>
          <Link to="/todos">Go to todos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/users">Go to directory</Link>
        </Button>
      </div>
    </div>
  )
}
