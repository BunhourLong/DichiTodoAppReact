const FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

/**
 * Money is stored as whole cents everywhere and only turned into a string at
 * the edge, so no total is ever the result of adding floats together.
 */
export function formatPrice(cents: number): string {
  return FORMATTER.format(cents / 100)
}
