/**
 * The jsonplaceholder `/users` shape, narrowed to the fields this UI reads.
 * This is the `T` that `useFetch<User[]>` is instantiated with, so every
 * `user.name` in a page is checked against this and nothing else.
 */
export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
  }
  company: {
    name: string
    catchPhrase: string
  }
}
