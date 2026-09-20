import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import UsersPage from '@/pages/UsersPage'
import type { User } from '@/types/user'

/**
 * Real timers here, on purpose.
 *
 * Testing Library's async helpers can advance a *Jest* fake clock, and only a
 * Jest one — under Vitest's they would sit waiting on a `setTimeout` that
 * nothing ever moves, and every await in this file would hang. So the 500 ms
 * is really waited out, and `findBy*` is what waits for it. The timing of the
 * hook itself is pinned down in `useDebounce.test.ts`, where there is no DOM
 * to await and a fake clock works perfectly.
 */
function makeUser(id: number, name: string, username: string): User {
  return {
    id,
    name,
    username,
    email: `${username.toLowerCase()}@example.com`,
    phone: '555-0100',
    website: 'example.com',
    address: { street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998' },
    company: { name: 'Deckow-Crist', catchPhrase: 'Proactive didactic contingency' },
  }
}

const USERS = [
  makeUser(1, 'Leanne Graham', 'Bret'),
  makeUser(2, 'Ervin Howell', 'Antonette'),
]

/** Stubs the one thing this page reaches outside itself for. */
function serve(body: unknown, init?: ResponseInit) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), init)),
  )
}

function renderPage() {
  // The page renders `Link`s, which need a router above them — the same one
  // the app provides, just an in-memory one.
  render(
    <MemoryRouter>
      <UsersPage />
    </MemoryRouter>,
  )

  return userEvent.setup()
}

beforeEach(() => {
  serve(USERS)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('UsersPage', () => {
  it('shows the loading state, then the users once the request answers', async () => {
    renderPage()

    // Before the await: the skeleton is what is actually on screen.
    expect(screen.getByLabelText('Loading users')).toBeInTheDocument()

    // findBy* = getBy* + waitFor. It is the only query that can wait for
    // something that is not there yet, and the await is the whole point —
    // nothing about the request is pretended to be instant.
    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()

    // Absence, once the conditional element is gone for good.
    expect(screen.queryByLabelText('Loading users')).toBeNull()
  })

  it('raises the error state when the endpoint answers 404', async () => {
    serve('Not Found', { status: 404, statusText: 'Not Found' })

    renderPage()

    expect(
      await screen.findByText(/could not load the directory/i),
    ).toBeInTheDocument()
    // fetch does not reject on a 404, so this only passes because the hook
    // raises the error by hand.
    expect(screen.getByText(/404/)).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).toBeNull()
  })

  it('waits for the typing to stop before it filters the list', async () => {
    const user = renderPage()
    await screen.findByText('Leanne Graham')

    await user.type(screen.getByLabelText(/search the directory/i), 'ervin')

    // Five keystrokes in and the list has not moved: the debounced value the
    // filter reads is still the empty string, and the box says as much.
    expect(screen.getByText('settling…')).toBeInTheDocument()
    expect(screen.getByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()

    // 500 ms after the last key, the filter runs — once.
    expect(await screen.findByText('Showing 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).toBeNull()
    expect(screen.queryByText('settling…')).toBeNull()
  })

  it('says so when the filter matches nobody, without losing the data', async () => {
    const user = renderPage()
    await screen.findByText('Leanne Graham')

    await user.type(screen.getByLabelText(/search the directory/i), 'zzz')

    expect(await screen.findByText(/nobody matches/i)).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).toBeNull()
    // The users are still loaded — only the filter is hiding them, and the
    // empty state says which of the two situations this is.
    expect(screen.getByText(/all 2 users are still loaded/i)).toBeInTheDocument()
  })

  it('brings everyone back when the box is cleared', async () => {
    const user = renderPage()
    await screen.findByText('Leanne Graham')
    const searchBox = screen.getByLabelText(/search the directory/i)

    await user.type(searchBox, 'ervin')
    await screen.findByText('Showing 1 of 2')
    expect(screen.queryByText('Leanne Graham')).toBeNull()

    await user.clear(searchBox)

    expect(await screen.findByText('Leanne Graham')).toBeInTheDocument()
    expect(screen.getByText('Ervin Howell')).toBeInTheDocument()
  })
})
