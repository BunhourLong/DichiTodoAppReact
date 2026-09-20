import { NavLink, Outlet } from 'react-router-dom'
import { ListTodo, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import LiveClock from '@/components/layout/LiveClock'
import WindowWidth from '@/components/layout/WindowWidth'

const NAV_ITEMS = [
  { to: '/todos', label: 'Todos', icon: ListTodo },
  { to: '/users', label: 'Directory', icon: Users },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-4 px-4">
          <NavLink to="/todos" className="font-semibold tracking-tight">
            Dichi<span className="text-muted-foreground">Todo</span>
          </NavLink>

          <nav className="flex items-center gap-1" aria-label="Main">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 text-xs text-foreground sm:flex">
            <WindowWidth />
            <LiveClock />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-3xl px-4 pb-10 text-xs text-muted-foreground">
        <div className="flex items-center gap-3 sm:hidden">
          <WindowWidth />
          <LiveClock />
        </div>
      </footer>
    </div>
  )
}
