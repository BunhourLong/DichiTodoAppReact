export interface Todo {
  id: string
  text: string
  completed: boolean
}

/** The three filters the bar can be in — not `string`, so a typo fails to compile. */
export type TodoFilter = 'all' | 'active' | 'completed'
