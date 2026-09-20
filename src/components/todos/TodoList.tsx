import TodoItem from '@/components/todos/TodoItem'
import type { Todo } from '@/types/todo'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  emptyMessage: string
}

/**
 * Receives the already-filtered array. It never filters, never stores and
 * never mutates — deciding what is visible is the owner's job.
 */
export default function TodoList({
  todos,
  onToggle,
  onDelete,
  emptyMessage,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
