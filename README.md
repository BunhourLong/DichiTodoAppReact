# DichiTodoApp

A React 19 app for the state / effects / data-fetching / routing module: one
owner for shared state, effects that clean up after themselves, fetches that
survive race conditions, and a route for every view.

**Stack:** React · Vite · Tailwind CSS · shadcn/ui · React Router · ESLint

## Running it

```bash
npm install
npm run dev
```

Then open the printed URL. Other scripts: `npm run lint`, `npm run build`,
`npm run preview`.

## Routes

| Path | View |
| --- | --- |
| `/` | redirects to `/todos` |
| `/todos` | the todo list |
| `/users` | the user directory |
| `/users/:id` | one user, read from the URL with `useParams` |
| `*` | 404 catch-all |

Navigation is `Link` / `NavLink` only, so moving between pages never reloads the
page and the header's clock keeps ticking straight through.

## 1. Lifted state

`src/pages/TodosPage.jsx` owns the todo array and the active filter. Nothing
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
| `UsersPage` — directory fetch | `[url, attempt]` | `cancelled = true` + `controller.abort()` | Prevents a slow response for a source you have already switched away from landing late and overwriting the list you are actually looking at. |
| `UserDetailPage` — single user fetch | `[id]` | `cancelled = true` + `controller.abort()` | Prevents the previous user's response from painting itself onto the new user's page when you move between ids faster than the network answers. |

Both `[]` dependency lists are honest: those effects read nothing from props or
state, they only subscribe. `react-hooks/exhaustive-deps` is configured as an
**error** in `eslint.config.js`, so a missing dependency fails the lint run.

Navigating the whole app produces zero console warnings or errors.

## 3. The fetch, and its four states

`src/pages/UsersPage.jsx` renders every outcome of a real request to
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

```js
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
}, [url, attempt])
```

Switch sources twice quickly and two requests are in flight at once. Without the
flag, whichever answered *last* would win and paint the wrong list. `abort()`
stops the request; `cancelled` still matters because a response can already be
resolving by the time the cleanup runs.

## 4. Routing

`src/App.jsx` holds the whole route table. `/users/:id` reads its id with
`useParams` and that id is the effect's only dependency — change the URL and the
fetch re-runs, stay put and it does not.

Opening `/users/3` directly works, because the id comes from the URL rather than
from something a previous page handed over:

![Deep-linked user detail](docs/screenshots/07-user-detail-direct-url.png)

A valid route with a record that does not exist is an error state, not a crash:

![Unknown user id](docs/screenshots/08-user-detail-unknown-id.png)

Anything that matches no route at all hits `path="*"`:

![404 catch-all](docs/screenshots/09-404-catch-all.png)

## Audit checklist

- [x] Shared state lives in ONE component — `TodosPage` owns the array; children are stateless
- [x] Every effect lists only the values it reads — `exhaustive-deps` is an error, lint passes
- [x] Cleanup on every listener and timer — interval, resize listener, and both fetches
- [x] Navigating between pages never crashes — verified across every route, including deep links and garbage URLs
- [x] Fetch renders loading, error, empty and data
- [x] Race conditions guarded with a `cancelled` flag
