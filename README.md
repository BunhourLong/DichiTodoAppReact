# DichiTodoApp

A React 19 app built module by module: one owner for shared state, effects that
clean up after themselves, fetches that survive race conditions, a route for
every view, context instead of prop drilling, hooks any component can pick up,
and tests that drive the UI the way a user does.

**Stack:** React · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router · Vitest · Testing Library · ESLint

## Running it

```bash
npm install
npm run dev
```

Then open the printed URL. Other scripts: `npm test` (watch) and
`npm run test:run` (one-shot), `npm run lint`, `npm run typecheck`,
`npm run build` (which typechecks first), `npm run preview`.

## Routes

| Path | View |
| --- | --- |
| `/` | redirects to `/todos` |
| `/todos` | the todo list |
| `/users` | the user directory |
| `/users/:id` | one user, read from the URL with `useParams` |
| `/shop` | the catalog, with the buttons that dispatch cart actions |
| `/checkout` | the cart lines and the order summary |
| `*` | 404 catch-all |

Navigation is `Link` / `NavLink` only, so moving between pages never reloads the
page and the header's clock keeps ticking straight through.

## 1. Lifted state

`src/pages/TodosPage.tsx` owns the todo array and the active filter. Nothing
else does.

```
TodosPage  ← owns todos + filter
├── AddTodo     onAdd(text)
├── FilterBar   filter, activeCount, completedCount → onFilterChange, onClearCompleted
└── TodoList    todos (already filtered) → onToggle, onDelete
    └── TodoItem
```

Every child is stateless with respect to the todos: values go **down** as props,
intent comes **back up** as callbacks. `AddTodo` keeps the text currently typed
into its own input, which is private UI state, not shared state.

The visible list, the "items left" counter and the completed count are all
**derived during render** from the one array — never stored in a second piece of
state that could drift.

`Clear completed` lives in `FilterBar` but the array it clears lives in
`TodosPage`; the button just calls `onClearCompleted()`.

![Todos filtered to Active](docs/screenshots/01-todos-filtering.png)
![After clearing completed](docs/screenshots/02-todos-clear-completed.png)

## 2. Effects, and what each cleanup prevents

| Effect | Deps | Cleanup | One sentence |
| --- | --- | --- | --- |
| `LiveClock` — ticking clock | `[]` | `clearInterval` | Prevents the 1-second interval from outliving the component and calling `setState` on something React has already unmounted. |
| `WindowWidth` — live width readout | `[]` | `removeEventListener` | Prevents a new `resize` listener being added to `window` on every mount with none ever removed, so old listeners pile up and fire into dead components. |
| `useFetch` — every request in the app | `[url, reloadKey]` | `cancelled = true` + `controller.abort()` | Prevents a slow response for a URL you have already moved away from landing late and overwriting the data you are actually looking at. Both fetching pages share this one effect. |

Both `[]` dependency lists are honest: those effects read nothing from props or
state, they only subscribe. `react-hooks/exhaustive-deps` is configured as an
**error** in `eslint.config.js`, so a missing dependency fails the lint run.

Navigating the whole app produces zero console warnings or errors.

## 3. The fetch, and its four states

`src/pages/UsersPage.tsx` renders every outcome of a real request to
`jsonplaceholder.typicode.com`. The three buttons at the top pick a real
endpoint, so no state is faked:

| State | How it is reached |
| --- | --- |
| **Loading** | skeleton rows in the shape of the real rows, so nothing jumps on arrival |
| **Loaded** | `GET /users` → 10 users |
| **Empty** | `GET /users?id=0` → `200 OK` with `[]` — the request worked, there is just nothing in it |
| **Error** | `GET /users/not-a-real-path` → `404`, raised by hand because `fetch` only rejects on network failure |

![Loading](docs/screenshots/03-directory-loading.png)
![Loaded](docs/screenshots/04-directory-loaded.png)
![Empty](docs/screenshots/05-directory-empty.png)
![Error](docs/screenshots/06-directory-error.png)

### Surviving the race

Since the TypeScript move this lives in `src/hooks/useFetch.ts` rather than in
each page, but it is the same guard:

```ts
useEffect(() => {
  let cancelled = false
  const controller = new AbortController()

  async function loadUsers() {
    setStatus('loading')
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (!response.ok) {
        throw new Error(`Request failed — ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      if (cancelled) return        // ← a response from a run we moved on from
      setUsers(data)
      setStatus('success')
    } catch (requestError) {
      if (cancelled || requestError.name === 'AbortError') return
      setError(requestError.message)
      setStatus('error')
    }
  }

  loadUsers()
  return () => {
    cancelled = true
    controller.abort()
  }
}, [url, reloadKey])
```

Switch sources twice quickly and two requests are in flight at once. Without the
flag, whichever answered *last* would win and paint the wrong list. `abort()`
stops the request; `cancelled` still matters because a response can already be
resolving by the time the cleanup runs.

## 4. Routing

`src/App.tsx` holds the whole route table. `/users/:id` reads its id with
`useParams` and that id is the effect's only dependency — change the URL and the
fetch re-runs, stay put and it does not.

Opening `/users/3` directly works, because the id comes from the URL rather than
from something a previous page handed over:

![Deep-linked user detail](docs/screenshots/07-user-detail-direct-url.png)

A valid route with a record that does not exist is an error state, not a crash:

![Unknown user id](docs/screenshots/08-user-detail-unknown-id.png)

Anything that matches no route at all hits `path="*"`:

![404 catch-all](docs/screenshots/09-404-catch-all.png)

## 5. `useFetch<T>` — one generic async state machine

`src/hooks/useFetch.ts`. A `useReducer` over a three-state union, returning the
flat triple callers actually want:

```ts
type FetchState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

export function useFetch<T>(url: string, reloadKey = 0): {
  data: T | null
  loading: boolean
  error: string | null
}
```

Each state carries exactly the data that state has. There is no
`{ loading: true, data: …, error: … }` to reason about, because the union
cannot describe one — that is what "typed state machine" buys you.

Both fetching pages instantiate it with a different `T`:

```ts
const { data: users, loading, error } = useFetch<User[]>(url, attempt)   // UsersPage
const { data: user,  loading, error } = useFetch<User>(userUrl)          // UserDetailPage
```

**Confirming it narrows.** Not by reading it — by making the compiler object.
Temporarily writing this into the tree:

```ts
const { data } = useFetch<User[]>('/x')
data.length                        // error TS18047: 'data' is possibly 'null'
if (data) data.map((u) => u.nmae)  // error TS2339: Property 'nmae' does not exist on type 'User'
if (data) data.map((u) => u.name)  // fine
```

`data` is `User[] | null` and its elements are `User`. The hook itself never
imported `User`; the call site named the shape once and the compiler carried it
the rest of the way.

`reloadKey` is an optional second argument, there only so the "Try again"
button can re-run an unchanged URL. It does not change the returned shape.

## 6. `AuthContext` — the end of prop drilling

Three files, so that each one exports either components or values and
`react-refresh` stays happy without an eslint-disable:

| File | What is in it |
| --- | --- |
| `src/context/auth-context.ts` | `AuthUser`, `AuthContextValue`, `createContext` |
| `src/context/AuthProvider.tsx` | the one owner of `user`, wrapping the app in `main.tsx` |
| `src/hooks/useAuth.ts` | the consumer hook |

The context default is `null`, and it means **"there is no provider above me"** —
deliberately not the same value as "signed out", which is `user: null` *inside*
a real context value. `useAuth` throws on the first case, so its return type is
`AuthContextValue` and never `| null`; no caller ever null-checks `signIn`.

`NavBar` is a sibling of the pages, not a child of anything that knows about
auth, and it still renders **"Sign in"** or **"Hi, {user.email}"** — because it
calls `useAuth()` instead of waiting for a `user` prop to be threaded down to
it. Whether the little sign-in form is open, and the text typed into it, stay
as local state in `NavBar`: private UI state is not shared state.

## 7. `CartContext` — every rule in one pure function

`src/context/cart-context.ts` holds the discriminated union and the reducer:

```ts
export type CartAction =
  | { type: 'ADD_ITEM';        payload: { product: Product } }
  | { type: 'REMOVE_ITEM';     payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
```

`type` is the discriminant, and each arm carries its own payload and no other:
`REMOVE_ITEM` has no `quantity` field to set, and there is no `SET_ITEMS` arm
that would let a component hand the reducer a line it built itself. Those three
arms are the cart's entire surface area, checked at compile time.

`cartReducer` owns the rules, and the components own none of them:

| Action | Rule |
| --- | --- |
| `ADD_ITEM` | a product already in the cart bumps its quantity — one line of two, not two lines |
| `REMOVE_ITEM` | drop the line |
| `UPDATE_QUANTITY` | **at or below zero, the line leaves the cart**; otherwise set it |

Dispatched from real buttons: "Add to cart" on `/shop`, and `−` / `+` / bin on
`/checkout`. Pressing `−` at quantity 1 sends `quantity: 0` and the line
disappears. The button does not know that rule — it reports what happened and
the reducer decides what the cart becomes.

### The checkout summary reads the cart via `useContext`

`src/components/cart/CheckoutSummary.tsx` **takes no props.** It sits inside a
card inside `CheckoutPage`, several levels below `CartProvider`, and nothing in
between knows the cart exists. `CartLines` is the same: no props, and its rows
are rendered inline rather than handed to a `<CartLine item={…} />` child,
because that prop would be cart data travelling down the tree.

Grep the whole `src/` tree for a component rendered with a cart-shaped prop and
the only hit is the comment explaining why there isn't one:

```
$ grep -rE '<[A-Z][A-Za-z]*[^>]*\b(items|item|cart|quantity|subtotal|total|line)=' src --include='*.tsx'
src/components/cart/CartLines.tsx:10: * `<CartLine item={…} />` child, because that prop would be cart data
```

Item count, subtotal, shipping and total are all derived during render from
`items`. None is stored, so none can drift.

### One sentence, as asked

> An item with quantity `-1` is unrepresentable because the discriminated union
> makes `UPDATE_QUANTITY` the only action that can touch a quantity, so every
> change to one is funnelled through the single `cartReducer` branch that
> deletes the line at anything `<= 0` — and no component has another door
> through which to put a number into `CartItem.quantity`.

### Screenshots

Screenshots are **not committed** — they ship zipped alongside each hand-in
(`Context&Reducers.zip`, `Hooks & Tests.zip`), and `*.zip` is in `.gitignore`.

## 8. Two hooks, extracted by hand

Both live in `src/hooks/`, both start with `use`, and neither knows anything
about the components that call them.

### `useLocalStorage(key, initial)`

`src/hooks/useLocalStorage.ts`. The signature is deliberately `useState`'s,
updater form included, so a component swaps one for the other without touching
a call site:

```ts
const [theme, setTheme] = useLocalStorage<Theme>('dichi-theme', 'light')
setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
```

React state is still the single owner of the value. Storage is a **mirror**
written after the fact, never something read during render — so there is no
second source of truth to drift.

| Detail | Why |
| --- | --- |
| Lazy initialiser | The key is read once per mount, not on every render. |
| Every read wrapped in `try` | Safari's private mode throws on `getItem`, and a key can hold half-written JSON from an older build. Neither is a reason to fail to render, so both fall back to `initial`. |
| `storage` listener + `removeEventListener` | Two open tabs stay in agreement, and the listener is taken back off (rule 4). |
| `initial` pinned in a ref | A caller passing an object literal would otherwise hand the hook a new `initial` every render and re-subscribe the listener each time. |

The consumer is `components/layout/ThemeToggle.tsx` in the header. Flip it, hit
refresh, and the theme is still there. Its own effect writes the `dark` class
onto `<html>` and has **no cleanup on purpose**: it subscribes to nothing and
schedules nothing, so there is nothing to take back — the comment in the file
says exactly that, as rule 4 requires.

### `useDebounce(value, 500)`

`src/hooks/useDebounce.ts`. `useRef` holds the one pending timer id; `useEffect`
sets it and clears it.

```ts
const [query, setQuery] = useState('')          // changes on every keystroke
const debouncedQuery = useDebounce(query, 500)  // changes once, after the last one
```

`/users` puts both on screen side by side, with a **settling…** badge while they
disagree, so the delay is something you can watch rather than take on faith. The
filter reads the debounced copy, so typing `leanne` runs it once instead of six
times — and the filtered list is derived during render from the one array, never
stored.

### What broke when the cleanup came off

Deleting the `return () => clearTimeout(…)` and re-running the suite failed two
tests, which is the honest answer to the question:

```
× useDebounce > restarts the clock on every keystroke rather than firing mid-word
  → expected 'lea' to be ''
× useDebounce > leaves no timer pending when the component unmounts
  → expected 2 to be 1
```

> Without the cleanup the timers stop cancelling each other, so every keystroke
> keeps its own 500 ms timer and they all fire in turn — the value is no longer
> debounced, it is the raw value on a delay, flickering through `l`, `le`, `lea`
> on its way to the real one, with a pile of timers still queued to fire into a
> component that may already be unmounted.

The sneaky part is that the *final* value still looks right, which is why
"settles once on the last value" kept passing. Only the test that asserts what
happens **mid-word**, and the one that counts pending timers, catch it.

## 9. Tests — Vitest + React Testing Library

```bash
npm test          # watch
npm run test:run  # one-shot, what CI would run
npx vitest run    # the same thing
```

`vite.config.ts` carries the `test` block: jsdom, and `include` pointed at
`src/**/*.test.{ts,tsx}` because **tests live next to the thing they test**, not
in a parallel tree.

`globals` is left **off** — `describe` / `it` / `expect` are imported in every
file like anything else. The cost is that React Testing Library's auto-cleanup
never registers itself, so `src/test/setup.ts` wires the unmount up by hand;
without it every render stays in the document and the next test's
`getByLabelText` finds two inputs. `localStorage` is cleared there too, since a
hook built to survive a refresh will happily survive into the next test.

| Suite | File | What it covers |
| --- | --- | --- |
| `OrderForm` | `src/components/cart/OrderForm.test.tsx` | renders, types, submits, validates, and two absence proofs |
| `UsersPage` | `src/pages/UsersPage.test.tsx` | the async load with `findBy`, the 404, and the debounced filter |
| `useLocalStorage` | `src/hooks/useLocalStorage.test.ts` | initial / stored / written back / corrupt JSON / survives a remount |
| `useDebounce` | `src/hooks/useDebounce.test.ts` | fake timers, rapid typing, and the pending-timer count after unmount |

### The form, driven the way a user drives it

```ts
emailField:   screen.getByLabelText(/email for the receipt/i)
submitButton: screen.getByRole('button', { name: /place order/i })
error:        await screen.findByRole('alert')
```

Every query is one a person could describe out loud: the field with that label,
the button that says that, the thing that shouted at me. **No test ids, no class
names, no reaching into the component.** Rearrange the markup and, as long as the
form still reads the same, the tests still pass.

Typing and submitting go through `userEvent` — by click *and* by Enter, because
a one-field form is usually left with the return key. The error is asserted to
be **attached to the field** (`toBeInvalid`, `toHaveAccessibleDescription`), not
merely somewhere on screen, because that attachment is the only way anyone on a
screen reader hears about it.

### Waiting for data with `findBy`

`UsersPage.test.tsx` stubs `fetch` per test and asserts the skeleton is what is
on screen *before* the await:

```ts
expect(screen.getByLabelText('Loading users')).toBeInTheDocument()
expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()
```

`findBy*` is `getBy*` + `waitFor`, and the only query that can wait for
something that is not there yet. A second test serves a 404 and asserts the
error state, which only appears because `useFetch` raises it by hand — `fetch`
does not reject on one.

### Proving absence

Five `queryBy*` assertions returning `null`, each one for an element that is
genuinely gone rather than merely different:

| Where | Once… |
| --- | --- |
| `OrderForm` | …nothing has been submitted yet, there is no alert at all |
| `OrderForm` | …the address is fixed, the complaint is gone |
| `UsersPage` | …the data lands, the loading skeleton is gone |
| `UsersPage` | …the debounce settles, the filtered-out user is gone |
| `UsersPage` | …it settles, so is the **settling…** badge |

`getBy*` cannot make any of those statements — it throws, and "it throws" is not
the same claim as "there is nothing showing".

### One footnote on fake timers

The hook tests run on `vi.useFakeTimers()`, which is what makes "499 ms is not
yet" assertable. The **DOM** tests deliberately do not: this version of Testing
Library can only advance a *Jest* fake clock, so under Vitest's its async
helpers sit waiting on a `setTimeout` that nothing ever moves, and every `await`
in the file hangs. So the 500 ms is really waited out there and `findBy` waits
for it — the timing itself is pinned down in `useDebounce.test.ts`, where there
is no DOM to await and a fake clock works perfectly.

## Audit checklist

- [x] Shared state lives in ONE component — `TodosPage` owns the array; children are stateless
- [x] Every effect lists only the values it reads — `exhaustive-deps` is an error, lint passes
- [x] Cleanup on every listener and timer — interval, resize listener, and both fetches
- [x] Navigating between pages never crashes — verified across every route, including deep links and garbage URLs
- [x] Fetch renders loading, error, empty and data
- [x] Race conditions guarded with a `cancelled` flag
- [x] `useFetch<T>` is generic — `useFetch<User[]>` narrows `data` to `User[] | null`, confirmed by forcing TS18047 and TS2339
- [x] `AuthContext` with `signIn(email)` / `signOut()`, a provider at the root, and a NavBar showing "Sign in" or "Hi, {user.email}"
- [x] `CartContext` on `useReducer` with a discriminated-union `CartAction` — ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY (0 removes the line), dispatched from real buttons
- [x] Checkout summary reads the cart via `useContext`; no prop carries cart data anywhere in the tree
- [x] `useLocalStorage(key, initial)` written by hand, keeping `useState`'s signature — the theme survives a refresh
- [x] `useDebounce(value, 500)` on `useRef` + `useEffect`, with raw and debounced shown side by side in the directory search
- [x] Every custom hook starts with `use` and calls hooks only at the top level
- [x] Every `setTimeout` has its `clearTimeout`, every listener its `removeEventListener` — asserted, not assumed
- [x] Vitest + React Testing Library, tests sitting next to the components they test
- [x] The form test renders with `getByLabelText`, types and submits with `userEvent`, and sees the validation error
- [x] An async test waits for data with `findBy*`
- [x] Absence proved with `queryBy*` returning `null`, five times over
- [x] Every query mirrors a user — labels, roles, visible text; not one test id
