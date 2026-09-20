import { useEffect, useRef, useState } from 'react'

/**
 * Trails `value` by `delayMs`, and only settles once the input stops moving.
 *
 * ```ts
 * const [query, setQuery] = useState('')
 * const debouncedQuery = useDebounce(query, 500)
 * ```
 *
 * `query` changes on every keystroke; `debouncedQuery` changes once, 500 ms
 * after the last one. Type "leanne" quickly and the filter runs a single time
 * instead of six.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  // The one pending timer for this hook instance. Keeping the id in a ref
  // rather than a local means "at most one timer in flight" is a property of
  // the hook you can point at, and the clear happens through the same handle
  // that set it. (The cleanup closes over the id as well — the ref is what
  // makes the invariant explicit across renders.)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setDebounced(value)
      timeoutRef.current = null
    }, delayMs)

    // Cleanup: clearTimeout. This is the whole hook.
    //
    // React runs it before the next run of this effect, so every new keystroke
    // cancels the timer the previous one started and only the last keystroke
    // ever reaches `setDebounced`. Drop it and the timers stop cancelling each
    // other: six keystrokes schedule six updates, they all fire 500 ms later,
    // and the value is no longer debounced — it is the raw value on a delay.
    // It also fires on unmount, so a pending timer cannot call `setDebounced`
    // on a component that is already gone.
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [value, delayMs])

  return debounced
}
