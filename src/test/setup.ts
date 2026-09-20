import { afterEach } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// The debounced search really waits 500 ms in the DOM tests, so the default
// 1000 ms budget for findBy*/waitFor is given some room above it.
configure({ asyncUtilTimeout: 2000 })

/**
 * Runs before every test file.
 *
 * `@testing-library/jest-dom/vitest` extends `expect` with the DOM matchers
 * (`toBeInTheDocument`, `toHaveValue`, …) and its types with them.
 *
 * The cleanup is the test-suite version of the rule the app is held to: React
 * Testing Library's auto-cleanup only registers itself when Vitest's globals
 * are on, and they are off here — so the unmount is wired up by hand instead.
 * Without it every render stays in the document and the next test's
 * `getByLabelText` finds two inputs.
 */
afterEach(() => {
  cleanup()
  // localStorage is shared by every test in a file. useLocalStorage is meant
  // to survive a refresh, so it would happily survive into the next test too.
  window.localStorage.clear()
})
