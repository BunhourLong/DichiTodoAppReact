import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CartLines from '@/components/cart/CartLines'

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

      <Card>
        <CardHeader>
          <CardTitle>Your cart</CardTitle>
        </CardHeader>
        <CardContent>
          <CartLines />
        </CardContent>
      </Card>
    </div>
  )
}
