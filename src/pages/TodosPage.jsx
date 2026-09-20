import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AddTodo from '@/components/todos/AddTodo'
import FilterBar from '@/components/todos/FilterBar'
import TodoList from '@/components/todos/TodoList'

const INITIAL_TODOS = [
  { id: 't1', text: 'Lift shared state into one owner', completed: true },
  { id: 't2', text: 'Give every listener and timer a cleanup', completed: false },
  { id: 't3', text: 'Guard the fetch with a cancelled flag', completed: false },
]

const EMPTY_MESSAGE = {
  all: 'Nothing here yet — add your first todo above.',
  active: 'No active todos. Everything is done.',
  completed: 'Nothing completed yet.',
}

/**
 * THE one owner of the todo state.
 *
 * AddTodo, FilterBar and TodoList are all stateless with respect to the todos:
 * data goes down as props, intent comes back up as callbacks. Because there is
 * exactly one copy of the array, there is nothing to keep in sync.
 */
export default function TodosPage() {
  const [todos, setTodos] = useState(INITIAL_TODOS)
  const [filter, setFilter] = useState('all')

  function handleAddTodo(text) {
    // Updater form: never read `todos` to compute the next `todos`.
    setTodos((current) => [
      ...current,
      { id: crypto.randomUUID(), text, completed: false },
    ])
  }

  function handleToggleTodo(id) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  function handleDeleteTodo(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function handleClearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  // Derived during render, never stored in state — a second copy is the thing
  // that goes stale.
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })
  const activeCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - activeCount

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Todos</h1>
        <p className="text-sm text-muted-foreground">
          One array, one owner. Every child talks through props and callbacks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {todos.length} {todos.length === 1 ? 'todo' : 'todos'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <AddTodo onAdd={handleAddTodo} />

          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            activeCount={activeCount}
            completedCount={completedCount}
            onClearCompleted={handleClearCompleted}
          />

          <TodoList
            todos={visibleTodos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            emptyMessage={EMPTY_MESSAGE[filter]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
