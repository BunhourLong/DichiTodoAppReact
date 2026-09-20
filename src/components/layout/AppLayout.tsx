import { Outlet } from 'react-router-dom'
import NavBar from '@/components/layout/NavBar'
import LiveClock from '@/components/layout/LiveClock'
import WindowWidth from '@/components/layout/WindowWidth'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-10 text-xs text-muted-foreground">
        <div className="flex items-center gap-3 lg:hidden">
          <WindowWidth />
          <LiveClock />
        </div>
      </footer>
    </div>
  )
}
