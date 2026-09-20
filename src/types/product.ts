/** Something on the shelf. A product is not a cart line: it has no quantity. */
export interface Product {
  id: string
  name: string
  description: string
  priceCents: number
}
