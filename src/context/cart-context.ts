import { createContext } from 'react'
import type { Dispatch } from 'react'
import type { Product } from '@/types/product'

/** A line in the cart: a product that has picked up a quantity. */
export interface CartItem {
  id: string
  name: string
  priceCents: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

/**
 * The discriminated union. `type` is the discriminant, and each arm carries
 * its own payload and no other — `REMOVE_ITEM` has no `quantity` field to
 * set, and there is no `SET_ITEMS` arm that would let a component hand the
 * reducer a line it built itself.
 *
 * Every way the cart can change is one of these three. That is the whole
 * surface area, and it is checked at compile time.
 */
export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }

export const INITIAL_CART_STATE: CartState = { items: [] }

/**
 * Every cart rule, in one pure function. No component decides what a quantity
 * of zero means, or what adding a product already in the cart does — they say
 * what happened and this decides what the cart becomes.
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product } = action.payload
      const alreadyInCart = state.items.some((item) => item.id === product.id)

      // Adding the same product twice is one line of two, not two lines.
      if (alreadyInCart) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }

      return {
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            priceCents: product.priceCents,
            quantity: 1,
          },
        ],
      }
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.id !== action.payload.id),
      }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload

      // The rule the whole cart hangs on: a line at zero is not a line showing
      // zero, it is no line at all. Anything at or below zero leaves the cart
      // here, which is why no `CartItem` with a quantity of 0 or -1 ever
      // reaches state — there is no other way in.
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.id !== id) }
      }

      return {
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      }
    }
  }
}

/** Derived on demand, never stored — see AGENTS.md rule 2. */
export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.priceCents * item.quantity, 0)
}

export interface CartContextValue {
  items: CartItem[]
  dispatch: Dispatch<CartAction>
}

/** `null` means "no CartProvider above me"; `useCart` turns that into a throw. */
export const CartContext = createContext<CartContextValue | null>(null)
