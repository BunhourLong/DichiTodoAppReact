import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'

/**
 * Effect #1 — a timer.
 * Cleanup: clearInterval. Without it the interval survives the unmount and
 * keeps calling setNow on a component that no longer exists, which leaks the
 * timer forever and warns in the console.
 */
export default function LiveClock() {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(intervalId)
    // Reads nothing from props or state (setNow is stable), so the dependency
    // list is genuinely empty — the timer is started once per mount.
  }, [])

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums"
      aria-label="Current time"
    >
      <Clock3 className="size-3.5 text-muted-foreground" aria-hidden="true" />
      {now.toLocaleTimeString()}
    </span>
  )
}
