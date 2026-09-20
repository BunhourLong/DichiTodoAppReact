import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * Reads one key and never throws.
 *
 * Three real ways this fails, and none of them is a reason to fail to render:
 * Safari's private mode throws on `getItem`, the key can hold a value written
 * by an older build that no longer parses, and `JSON.parse('undefined')` is a
 * syntax error. All three fall back to the initial value.
 */
function readStored<T>(key: string, initial: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? initial : (JSON.parse(raw) as T)
  } catch {
    return initial
  }
}

/**
 * `useState`, with the value surviving a refresh.
 *
 * The signature is deliberately `useState`'s, updater form included, so a
 * component swaps one for the other without changing a call site:
 *
 * ```ts
 * const [theme, setTheme] = useLocalStorage<Theme>('dichi-theme', 'light')
 * setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
 * ```
 *
 * There is still exactly one owner of the value — React state — and storage
 * is a mirror written after the fact, not a second source of truth anybody
 * reads during render.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initialiser: localStorage is touched once per mount, not on every
  // render. Passing `readStored(key, initial)` directly would read the disk
  // on every keystroke elsewhere in the component and throw the result away.
  const [value, setValue] = useState<T>(() => readStored(key, initial))

  // `initial` is only meaningful on the first read, so it is pinned here
  // rather than listed as a dependency — a caller passing an object literal
  // would otherwise hand this hook a new `initial` on every single render and
  // re-subscribe the listener below each time.
  const initialRef = useRef(initial)

  // Effect #1 — write through. Runs on mount too, which is what keeps state
  // and storage in agreement from the very first render.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // A full quota or a blocked store: the app keeps working in memory, it
      // just will not survive the refresh. Not worth taking the UI down for.
    }
  }, [key, value])

  // Effect #2 — a subscription, so two open tabs do not disagree. `storage`
  // fires in every *other* tab that shares the origin.
  // Cleanup: removeEventListener. Without it each mount leaves another
  // listener on `window`, and they pile up firing into dead components.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return
      // `event.key` is null when another tab called `localStorage.clear()`,
      // which clears our key too — so that counts as a change.
      if (event.key !== null && event.key !== key) return

      setValue(readStored(key, initialRef.current))
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [key])

  return [value, setValue]
}
