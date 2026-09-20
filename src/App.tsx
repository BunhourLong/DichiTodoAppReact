import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import TodosPage from '@/pages/TodosPage'
import UsersPage from '@/pages/UsersPage'
import UserDetailPage from '@/pages/UserDetailPage'
import ShopPage from '@/pages/ShopPage'
import CheckoutPage from '@/pages/CheckoutPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Every page renders inside the same chrome, so the header (and the
          live clock / width readout it owns) is never torn down and rebuilt
          while navigating. */}
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/todos" replace />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        {/* Catch-all: anything that matched nothing above lands here. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
