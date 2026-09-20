import { useState } from 'react'
import type { FormEvent } from 'react'
import { Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Deliberately loose: something, an @, something, a dot, something. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface OrderFormProps {
  onPlaceOrder: (email: string) => void
}

/** The one place that decides whether an address is good enough to send to. */
function problemWith(email: string): string | null {
  const trimmed = email.trim()

  if (trimmed === '') {
    return 'Enter an email address so we know where to send the receipt.'
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'That is not an email address — check for a missing @ or domain.'
  }

  return null
}

/**
 * Owns two things, both of them private UI state: the text in its own input,
 * and whether that text has been complained about yet. The order itself is
 * not its business — it reports a valid address up through `onPlaceOrder` and
 * `CheckoutPage` decides what that means.
 */
export default function OrderForm({ onPlaceOrder }: OrderFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const problem = problemWith(email)
    if (problem) {
      setError(problem)
      return
    }

    setError(null)
    onPlaceOrder(email.trim())
    setEmail('')
  }

  return (
    // `noValidate`: the message below is ours, so the browser's own bubble for
    // type="email" is turned off rather than left to fire first and swallow
    // the submit.
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="order-email">Email for the receipt</Label>
        <Input
          id="order-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : 'order-email-error'}
        />
      </div>

      {/* Rendered only when there is something to say. Until the first bad
          submit there is no element here at all — which is what the test
          asserts with queryByRole rather than getByRole. */}
      {error !== null && (
        <p
          id="order-email-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Not disabled on an empty field: submitting nothing has to be able to
          reach the validation, which is the thing being demonstrated. */}
      <Button type="submit" className="w-full">
        <Receipt data-icon="inline-start" aria-hidden="true" />
        Place order
      </Button>
    </form>
  )
}
