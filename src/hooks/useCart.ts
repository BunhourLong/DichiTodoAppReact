import { useContext } from 'react'
import { CartContext } from '@/context/cart-context'
import type { CartContextValue } from '@/context/cart-context'

/**
 * The only way to reach the cart. `dispatch` is handed out rather than a set
 * of wrapper functions, so every call site spells out which member of the
 * action union it is sending.
 */
export function useCart(): CartContextValue {
  const value = useContext(CartContext)

  if (!value) {
    throw new Error('useCart must be called inside <CartProvider>.')
  }

  return value
}
