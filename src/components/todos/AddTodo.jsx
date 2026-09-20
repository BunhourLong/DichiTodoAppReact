import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Knows nothing about the todo array. It owns exactly one thing: the text
 * currently typed into its own input (local UI state, never shared), and it
 * hands finished text up through `onAdd`.
 */
export default function AddTodo({ onAdd }) {
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const trimmed = text.trim()
    if (!trimmed) return

    onAdd(trimmed)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="new-todo" className="sr-only">
          New todo
        </Label>
        <Input
          id="new-todo"
          name="new-todo"
          placeholder="What needs doing?"
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={text.trim() === ''}>
        <Plus data-icon="inline-start" aria-hidden="true" />
        Add
      </Button>
    </form>
  )
}
