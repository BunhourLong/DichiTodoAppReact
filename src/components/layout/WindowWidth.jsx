import { useEffect, useState } from 'react'
import { MonitorSmartphone } from 'lucide-react'

function breakpointFor(width) {
  if (width < 640) return 'sm'
  if (width < 768) return 'md'
  if (width < 1024) return 'lg'
  return 'xl'
}

/**
 * Effect #2 — a subscription.
 * Cleanup: removeEventListener. Without it every mount adds another resize
 * listener to `window` that is never taken off, so old listeners pile up and
 * fire setState on unmounted components on the next resize.
 */
export default function WindowWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
    // Same story as the clock: the effect reads no reactive value, it only
    // subscribes. An empty list is the honest answer, not a shortcut.
  }, [])

  // Derived during render — storing this in state would be a second source of
  // truth that could drift out of sync with `width`.
  const breakpoint = breakpointFor(width)

  return (
    <span
      className="inline-flex items-center gap-1.5 tabular-nums"
      aria-label="Window width"
    >
      <MonitorSmartphone
        className="size-3.5 text-muted-foreground"
        aria-hidden="true"
      />
      {width}px
      <span className="text-muted-foreground">({breakpoint})</span>
    </span>
  )
}
