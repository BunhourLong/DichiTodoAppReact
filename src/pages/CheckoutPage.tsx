import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CartLines from '@/components/cart/CartLines'
import CheckoutSummary from '@/components/cart/CheckoutSummary'
import OrderForm from '@/components/cart/OrderForm'

/**
 * Renders the cart without ever touching it: this page holds no cart state
 * and passes no cart props. Everything below reads the context directly.
 *
 * The one thing it does own is whether an order has been placed, because that
 * is not cart data and nothing else in the tree needs it.
 */
export default function CheckoutPage() {
  const [receiptEmail, setReceiptEmail] = useState<string | null>(null)

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

        <div className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Place the order</CardTitle>
            </CardHeader>
            <CardContent>
              {receiptEmail === null ? (
                <OrderForm onPlaceOrder={setReceiptEmail} />
              ) : (
                <div className="space-y-3" role="status">
                  <p className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      Order placed. The receipt is on its way to{' '}
                      <span className="font-medium break-all">
                        {receiptEmail}
                      </span>
                      .
                    </span>
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setReceiptEmail(null)}
                  >
                    Place another order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
