import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/money'

/**
 * Takes no props at all — not even the items it renders. The cart is read
 * from context here, and the rows are rendered inline rather than handed to a
 * `<CartLine item={…} />` child, because that prop would be cart data
 * travelling down the tree, which is exactly what the context replaces.
 */
export default function CartLines() {
  const { items, dispatch } = useCart()

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-3 py-12 text-center">
        <ShoppingBag
          className="mx-auto size-6 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mt-2 text-sm font-medium">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop a quantity to zero and the line leaves for good.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link to="/shop">Back to the shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-3 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatPrice(item.priceCents)} each
            </p>
          </div>

          <div
            className="flex items-center gap-1 rounded-lg border p-0.5"
            role="group"
            aria-label={`Quantity for ${item.name}`}
          >
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Decrease quantity of ${item.name}`}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_QUANTITY',
                  // At quantity 1 this sends 0, and the reducer drops the line.
                  // The button does not know that rule; the reducer does.
                  payload: { id: item.id, quantity: item.quantity - 1 },
                })
              }
            >
              <Minus aria-hidden="true" />
            </Button>

            <span className="w-7 text-center text-sm tabular-nums">
              {item.quantity}
            </span>

            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Increase quantity of ${item.name}`}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_QUANTITY',
                  payload: { id: item.id, quantity: item.quantity + 1 },
                })
              }
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>

          <span className="w-20 text-right text-sm font-medium tabular-nums">
            {formatPrice(item.priceCents * item.quantity)}
          </span>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Remove ${item.name} from the cart`}
            className="text-muted-foreground hover:text-destructive"
            onClick={() =>
              dispatch({ type: 'REMOVE_ITEM', payload: { id: item.id } })
            }
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
