import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/context/auth-context'
import type { AuthContextValue, AuthUser } from '@/context/auth-context'

interface AuthProviderProps {
  children: ReactNode
}

/**
 * The one owner of the signed-in user. Nothing below it holds a second copy,
 * and no component passes `user` down as a prop — the NavBar is a sibling of
 * the pages, not a child of whoever knows about auth.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const signIn = useCallback((email: string) => {
    setUser({ email: email.trim() })
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  // Without this, the value object is new on every render of the provider and
  // every consumer re-renders whether or not the user actually changed.
  const value = useMemo<AuthContextValue>(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
