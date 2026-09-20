import { useEffect, useMemo, useReducer } from 'react'

/**
 * The async state machine.
 *
 * Three states, and each one carries exactly the data that state has:
 * `success` has data and no error, `error` has an error and no data. There is
 * no `{ loading: true, data: …, error: … }` object to reason about, because
 * the union cannot describe one.
 */
type FetchState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

type FetchAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; error: string }

/** The flat shape callers read. `T` flows straight through to `data`. */
export interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Every transition is decided by the action alone, so the previous state is
// never read — `_` marks that on purpose rather than hiding it.
function fetchReducer<T>(
  _state: FetchState<T>,
  action: FetchAction<T>,
): FetchState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading' }
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload }
    case 'FETCH_ERROR':
      return { status: 'error', error: action.error }
  }
}

/**
 * `useFetch<User[]>(url)` → `data` is `User[] | null`, and nothing else.
 *
 * The generic is the whole point: the hook itself knows nothing about users,
 * but the call site names the shape once and every `user.name` downstream is
 * checked against it.
 *
 * `reloadKey` is optional and exists only so a "Try again" button can re-run
 * the same URL — changing it re-runs the effect, exactly as changing `url`
 * does. The returned shape is unaffected.
 */
export function useFetch<T>(url: string, reloadKey = 0): UseFetchResult<T> {
  const initialState: FetchState<T> = { status: 'loading' }
  const [state, dispatch] = useReducer(fetchReducer<T>, initialState)

  useEffect(() => {
    // The race guard. Switch URLs twice quickly and two requests are in flight
    // at once; whichever answers last would otherwise win. The cleanup flips
    // this flag, so a response belonging to a run we have moved on from is
    // read and thrown away.
    let cancelled = false
    const controller = new AbortController()

    async function run() {
      dispatch({ type: 'FETCH_START' })

      try {
        const response = await fetch(url, { signal: controller.signal })

        // fetch only rejects on network failure — a 404 is a resolved promise
        // with ok === false, so the error state has to be raised by hand.
        if (!response.ok) {
          throw new Error(
            `Request failed — ${response.status} ${response.statusText}`,
          )
        }

        // The one assertion in the hook, and the honest place for it: JSON off
        // the wire is `any`, and `T` is the caller's claim about its shape.
        const payload = (await response.json()) as T
        if (cancelled) return

        dispatch({ type: 'FETCH_SUCCESS', payload })
      } catch (requestError) {
        if (cancelled) return
        if (requestError instanceof Error && requestError.name === 'AbortError') {
          return
        }

        dispatch({
          type: 'FETCH_ERROR',
          error:
            requestError instanceof Error
              ? requestError.message
              : 'Request failed.',
        })
      }
    }

    run()

    return () => {
      cancelled = true
      // abort() stops the request itself; `cancelled` still matters because a
      // response can already be resolving when the cleanup runs.
      controller.abort()
    }
  }, [url, reloadKey])

  // Derived from the machine during render, never stored alongside it — a
  // second copy is the thing that goes stale.
  return useMemo<UseFetchResult<T>>(
    () => ({
      data: state.status === 'success' ? state.data : null,
      loading: state.status === 'loading',
      error: state.status === 'error' ? state.error : null,
    }),
    [state],
  )
}
