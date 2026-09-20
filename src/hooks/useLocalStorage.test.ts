import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const KEY = 'dichi-theme'

describe('useLocalStorage', () => {
  it('starts from the initial value when the key has never been written', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'light'))

    expect(result.current[0]).toBe('light')
  })

  it('prefers what is already on disk over the initial value', () => {
    window.localStorage.setItem(KEY, JSON.stringify('dark'))

    const { result } = renderHook(() => useLocalStorage(KEY, 'light'))

    expect(result.current[0]).toBe('dark')
  })

  it('writes every update back to the key', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'light'))

    act(() => result.current[1]('dark'))

    expect(result.current[0]).toBe('dark')
    expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify('dark'))
  })

  it('takes the updater form, exactly like useState', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'light'))

    act(() =>
      result.current[1]((current) => (current === 'dark' ? 'light' : 'dark')),
    )

    expect(result.current[0]).toBe('dark')
  })

  it('survives a remount — which is the whole point', () => {
    const first = renderHook(() => useLocalStorage(KEY, 'light'))
    act(() => first.result.current[1]('dark'))
    first.unmount()

    // A remount is as close as a test gets to a refresh: new component, same
    // origin, same key.
    const second = renderHook(() => useLocalStorage(KEY, 'light'))

    expect(second.result.current[0]).toBe('dark')
  })

  it('round-trips a value that is not a string', () => {
    const { result } = renderHook(() =>
      useLocalStorage(KEY, { collapsed: false, rows: 5 }),
    )

    act(() => result.current[1]({ collapsed: true, rows: 12 }))

    expect(result.current[0]).toEqual({ collapsed: true, rows: 12 })
  })

  it('falls back to the initial value when the stored JSON is corrupt', () => {
    // What a half-finished write, or a value from an older build, looks like.
    window.localStorage.setItem(KEY, '{"theme": "da')

    const { result } = renderHook(() => useLocalStorage(KEY, 'light'))

    // Renders rather than throwing, which is the only acceptable answer.
    expect(result.current[0]).toBe('light')
  })
})
