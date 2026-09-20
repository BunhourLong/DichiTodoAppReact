import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ListTodo, LogIn, LogOut, ShoppingCart, Store, Users, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LiveClock from '@/components/layout/LiveClock'
import WindowWidth from '@/components/layout/WindowWidth'
import { cartItemCount } from '@/context/cart-context'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Only the checkout link wears the cart count. */
  showCartCount?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/todos', label: 'Todos', icon: ListTodo },
  { to: '/users', label: 'Directory', icon: Users },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/checkout', label: 'Checkout', icon: ShoppingCart, showCartCount: true },
]

/**
 * The NavBar is nobody's child in the data sense: it sits beside the pages,
 * and it still knows who is signed in — because it reads `useAuth()` rather
 * than waiting for a `user` prop to be threaded down to it.
 */
export default function NavBar() {
  const { user, signIn, signOut } = useAuth()
  const { items } = useCart()

  // Derived during render from the one cart array.
  const totalInCart = cartItemCount(items)

  // Private UI state: whether the little sign-in form is open and what is
  // typed in it. Neither is shared, so neither belongs in the context.
  const [formOpen, setFormOpen] = useState(false)
  const [email, setEmail] = useState('')

  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) return

    signIn(trimmed)
    setEmail('')
    setFormOpen(false)
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4">
        <NavLink to="/todos" className="font-semibold tracking-tight">
          Dichi<span className="text-muted-foreground">Todo</span>
        </NavLink>

        <nav className="flex items-center gap-1" aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon, showCartCount }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
              {showCartCount && totalInCart > 0 && (
                <Badge variant="secondary" className="px-1.5 tabular-nums">
                  {totalInCart}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 text-xs text-foreground lg:flex">
          <WindowWidth />
          <LiveClock />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {user ? (
            <>
              <span className="max-w-[10rem] truncate text-sm" title={user.email}>
                Hi, <span className="font-medium">{user.email}</span>
              </span>
              <Button type="button" size="sm" variant="ghost" onClick={signOut}>
                <LogOut data-icon="inline-start" aria-hidden="true" />
                Sign out
              </Button>
            </>
          ) : formOpen ? (
            <form onSubmit={handleSignIn} className="flex items-center gap-1.5">
              <Label htmlFor="sign-in-email" className="sr-only">
                Email
              </Label>
              <Input
                id="sign-in-email"
                name="email"
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                className="w-44"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button type="submit" size="sm" disabled={email.trim() === ''}>
                Sign in
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Cancel signing in"
                onClick={() => {
                  setFormOpen(false)
                  setEmail('')
                }}
              >
                <X aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <Button type="button" size="sm" onClick={() => setFormOpen(true)}>
              <LogIn data-icon="inline-start" aria-hidden="true" />
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
