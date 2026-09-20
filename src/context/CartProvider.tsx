import { useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import {
  CartContext,
  INITIAL_CART_STATE,
  cartReducer,
} from '@/context/cart-context'
import type { CartContextValue } from '@/context/cart-context'

interface CartProviderProps {
  children: ReactNode
}

/**
 * The one owner of the cart. It holds no logic of its own — the reducer is
 * the logic, and this just wires it to a context so anything in the tree can
 * dispatch into it without a prop chain.
 */
export default function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL_CART_STATE)

  const value = useMemo<CartContextValue>(
    () => ({ items: state.items, dispatch }),
    [state.items, dispatch],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
