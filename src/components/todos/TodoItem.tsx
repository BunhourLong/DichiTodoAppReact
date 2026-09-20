import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

/** Pure presentation: it is told what a todo looks like and reports clicks up. */
export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
      />
      <label
        htmlFor={`todo-${todo.id}`}
        className={cn(
          'flex-1 cursor-pointer text-sm',
          todo.completed && 'text-muted-foreground line-through',
        )}
      >
        {todo.text}
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete "${todo.text}"`}
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-destructive"
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  )
}
