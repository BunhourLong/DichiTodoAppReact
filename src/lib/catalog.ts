import type { Product } from '@/types/product'

/** A fixed shelf — the cart is the interesting part, not where products load from. */
export const CATALOG: Product[] = [
  {
    id: 'keyboard',
    name: 'Mechanical keyboard',
    description: '75%, hot-swappable, far too loud for a shared office.',
    priceCents: 12900,
  },
  {
    id: 'monitor',
    name: '27" monitor',
    description: '4K, so the type errors are legible from across the room.',
    priceCents: 39900,
  },
  {
    id: 'mouse',
    name: 'Vertical mouse',
    description: 'Looks strange, fixes wrists.',
    priceCents: 6500,
  },
  {
    id: 'coffee',
    name: 'Bag of coffee',
    description: 'The real dependency.',
    priceCents: 1800,
  },
]
