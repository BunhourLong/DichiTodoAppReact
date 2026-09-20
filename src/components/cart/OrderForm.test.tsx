import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OrderForm from '@/components/cart/OrderForm'

/**
 * Every query here is one a person could describe out loud: the field with
 * the label "Email for the receipt", the button that says "Place order", the
 * thing that shouted at me. No test ids, no class names, no reaching for
 * component internals — if the markup is rearranged tomorrow and the form
 * still reads the same, these tests still pass.
 */
function renderForm() {
  const onPlaceOrder = vi.fn()
  const user = userEvent.setup()

  render(<OrderForm onPlaceOrder={onPlaceOrder} />)

  return {
    user,
    onPlaceOrder,
    emailField: screen.getByLabelText(/email for the receipt/i),
    submitButton: screen.getByRole('button', { name: /place order/i }),
  }
}

describe('OrderForm', () => {
  it('renders an empty, labelled field and nothing to complain about yet', () => {
    const { emailField } = renderForm()

    expect(emailField).toBeInTheDocument()
    expect(emailField).toHaveValue('')
    // Absence, before anything has happened: getByRole would throw here, and
    // "it throws" is not the same statement as "there is no error showing".
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('hands a valid address up when the form is submitted', async () => {
    const { user, onPlaceOrder, emailField, submitButton } = renderForm()

    await user.type(emailField, 'ada@example.com')
    await user.click(submitButton)

    expect(onPlaceOrder).toHaveBeenCalledExactlyOnceWith('ada@example.com')
    // The box is emptied, ready for the next one.
    expect(emailField).toHaveValue('')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('submits on Enter, the way people actually leave a one-field form', async () => {
    const { user, onPlaceOrder, emailField } = renderForm()

    await user.type(emailField, 'ada@example.com{Enter}')

    expect(onPlaceOrder).toHaveBeenCalledExactlyOnceWith('ada@example.com')
  })

  it('trims the address before handing it up', async () => {
    const { user, onPlaceOrder, emailField, submitButton } = renderForm()

    await user.type(emailField, '   ada@example.com   ')
    await user.click(submitButton)

    expect(onPlaceOrder).toHaveBeenCalledExactlyOnceWith('ada@example.com')
  })

  it('complains about an empty field instead of placing the order', async () => {
    const { user, onPlaceOrder, emailField, submitButton } = renderForm()

    await user.click(submitButton)

    const error = await screen.findByRole('alert')
    expect(error).toHaveTextContent(/enter an email address/i)
    expect(onPlaceOrder).not.toHaveBeenCalled()
    // The error is not just on screen, it is attached to the field — which is
    // the only way someone using a screen reader ever hears about it.
    expect(emailField).toBeInvalid()
    expect(emailField).toHaveAccessibleDescription(/enter an email address/i)
  })

  it('complains about a whitespace-only field too', async () => {
    const { user, onPlaceOrder, emailField, submitButton } = renderForm()

    await user.type(emailField, '   ')
    await user.click(submitButton)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /enter an email address/i,
    )
    expect(onPlaceOrder).not.toHaveBeenCalled()
  })

  it('complains about something that is not an address at all', async () => {
    const { user, onPlaceOrder, emailField, submitButton } = renderForm()

    await user.type(emailField, 'ada.example.com')
    await user.click(submitButton)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /not an email address/i,
    )
    expect(onPlaceOrder).not.toHaveBeenCalled()
    // Whatever they typed is still there to be fixed, not thrown away.
    expect(emailField).toHaveValue('ada.example.com')
  })

  it('takes the complaint away once the address is fixed', async () => {
    const { user, onPlaceOrder, emailField, submitButton } = renderForm()

    await user.click(submitButton)
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.type(emailField, 'ada@example.com')
    await user.click(submitButton)

    // The absence assertion: the element is gone, so the query returns null
    // rather than throwing. `not.toBeInTheDocument()` on a getBy* would never
    // get this far — the getBy would have thrown first.
    expect(screen.queryByRole('alert')).toBeNull()
    expect(emailField).toBeValid()
    expect(onPlaceOrder).toHaveBeenCalledExactlyOnceWith('ada@example.com')
  })
})
