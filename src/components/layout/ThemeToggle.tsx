import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/hooks/useLocalStorage'

type Theme = 'light' | 'dark'

/**
 * The `useLocalStorage` demo, and the one piece of this app that survives a
 * refresh.
 *
 * The theme is ordinary React state as far as this component is concerned —
 * it reads `theme` and calls `setTheme`, exactly as it would with `useState`.
 * That the value came off disk and goes back to it is entirely the hook's
 * business, which is the point of extracting it.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<Theme>('dichi-theme', 'light')

  const isDark = theme === 'dark'

  // Tailwind's dark variant is `.dark *` (see index.css), so the class goes on
  // <html> and everything below it flips.
  //
  // No cleanup, on purpose: this effect subscribes to nothing and schedules
  // nothing, it just sets a value. Each run overwrites the previous one, so
  // nothing accumulates — there is no listener or timer here to take back.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label="Dark theme"
      aria-pressed={isDark}
      // Updater form: never read `theme` to compute the next `theme`.
      onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
    >
      {isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </Button>
  )
}
