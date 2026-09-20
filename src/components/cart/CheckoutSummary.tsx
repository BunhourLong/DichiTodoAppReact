import { Separator } from '@/components/ui/separator'
import { cartItemCount, cartSubtotalCents } from '@/context/cart-context'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/money'

/** Free shipping once the order is worth more than the postage. */
const FREE_SHIPPING_FROM_CENTS = 15000
const SHIPPING_CENTS = 995

/**
 * The point of the exercise: this component takes no props.
 *
 * It sits several levels below the provider, nothing between them knows the
 * cart exists, and it still renders a correct total — because it asks the
 * context itself. Every number here is derived during render from `items`;
 * none of them is stored anywhere, so none of them can go stale.
 */
export default function CheckoutSummary() {
  const { items } = useCart()
  const { user } = useAuth()

  const itemCount = cartItemCount(items)
  const subtotalCents = cartSubtotalCents(items)
  const shippingCents =
    itemCount === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS
      ? 0
      : SHIPPING_CENTS
  const totalCents = subtotalCents + shippingCents

  return (
    <div className="space-y-3">
      {/* Written out rather than routed through a `<SummaryRow value={…} />`
          helper, so that not even a formatted total travels as a prop. */}
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted-foreground">
          {itemCount === 1 ? '1 item' : `${itemCount} items`}
        </span>
        <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
      </div>

      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted-foreground">Shipping</span>
        <span className="tabular-nums">
          {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
        </span>
      </div>

      <Separator />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium">Total</span>
        <span className="text-lg font-semibold tabular-nums">
          {formatPrice(totalCents)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {user ? (
          <>
            Ordering as <span className="font-medium">{user.email}</span>.
          </>
        ) : (
          'Sign in from the header to place this order.'
        )}
      </p>
    </div>
  )
}
