export const API_BASE = 'https://jsonplaceholder.typicode.com'

/**
 * Three real endpoints, one per outcome, so every branch of the UI can be
 * demonstrated without faking a response:
 *  - `all`     -> 200 with ten users
 *  - `empty`   -> 200 with `[]`
 *  - `broken`  -> 404, which we turn into a thrown error
 */
export const USER_SOURCES = {
  all: { label: 'All users', url: `${API_BASE}/users` },
  empty: { label: 'Empty result', url: `${API_BASE}/users?id=0` },
  broken: { label: 'Broken endpoint', url: `${API_BASE}/users/not-a-real-path` },
} as const

export type UserSourceKey = keyof typeof USER_SOURCES

/** `Object.keys` widens to `string[]`; this keeps the three literal keys. */
export const USER_SOURCE_KEYS = Object.keys(USER_SOURCES) as UserSourceKey[]

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
