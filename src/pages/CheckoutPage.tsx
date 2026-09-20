import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CartLines from '@/components/cart/CartLines'
import CheckoutSummary from '@/components/cart/CheckoutSummary'

/**
 * Renders the cart without ever touching it: this page holds no cart state
 * and passes no cart props. Everything below reads the context directly.
 */
export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">
          Three actions, one reducer, zero cart props.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_16rem] md:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Your cart</CardTitle>
          </CardHeader>
          <CardContent>
            {/* No props. This component reads the cart itself. */}
            <CartLines />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent>
            {/* No props here either — and nothing in between carries the
                cart, so there is no prop chain to keep in sync. */}
            <CheckoutSummary />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
