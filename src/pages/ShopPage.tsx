import { Link } from 'react-router-dom'
import { Plus, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cartItemCount } from '@/context/cart-context'
import { useCart } from '@/hooks/useCart'
import { CATALOG } from '@/lib/catalog'
import { formatPrice } from '@/lib/money'

export default function ShopPage() {
  // Read straight from context. The shop is not a child of the cart, and the
  // cart is not a child of the shop — they are siblings that share an owner.
  const { items, dispatch } = useCart()

  const totalInCart = cartItemCount(items)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
          <p className="text-sm text-muted-foreground">
            Every button below dispatches one member of the cart action union.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link to="/checkout">
            <ShoppingCart data-icon="inline-start" aria-hidden="true" />
            Checkout
            {totalInCart > 0 && ` (${totalInCart})`}
          </Link>
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {CATALOG.map((product) => {
          // Derived during render from the one cart array — not a second copy.
          const line = items.find((item) => item.id === product.id)

          return (
            <li key={product.id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span>{product.name}</span>
                    {line && (
                      <Badge variant="secondary" className="shrink-0">
                        {line.quantity} in cart
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-sm font-medium tabular-nums">
                      {formatPrice(product.priceCents)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        dispatch({ type: 'ADD_ITEM', payload: { product } })
                      }
                    >
                      <Plus data-icon="inline-start" aria-hidden="true" />
                      Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
