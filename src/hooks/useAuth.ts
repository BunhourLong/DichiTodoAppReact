import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'
import type { AuthContextValue } from '@/context/auth-context'

/**
 * Reads the auth context, and refuses to return a half-working default if the
 * provider is missing. The return type is `AuthContextValue`, not
 * `AuthContextValue | null`, so callers never null-check `signIn`.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be called inside <AuthProvider>.')
  }

  return value
}
