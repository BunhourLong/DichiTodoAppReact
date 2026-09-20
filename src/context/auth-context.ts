import { createContext } from 'react'

/** Everything the app knows about whoever is signed in. */
export interface AuthUser {
  email: string
}

export interface AuthContextValue {
  /** `null` means signed out. */
  user: AuthUser | null
  signIn: (email: string) => void
  signOut: () => void
}

/**
 * The default is `null` on purpose, and it means "there is no provider above
 * me" — which is a different thing from "signed out" (`user: null` inside a
 * real value). `useAuth` turns the first case into a thrown error instead of
 * a component that silently never signs anyone in.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
