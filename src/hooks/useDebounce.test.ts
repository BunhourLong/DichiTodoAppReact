import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

// Real time would make this suite slow and flaky; fake timers make "499 ms is
// not yet" something the test can actually assert.
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function renderDebounce(initial: string, delayMs = 500) {
  return renderHook(({ value }) => useDebounce(value, delayMs), {
    initialProps: { value: initial },
  })
}

describe('useDebounce', () => {
  it('hands back the first value immediately, with no delay', () => {
    const { result } = renderDebounce('')

    expect(result.current).toBe('')
  })

  it('keeps the old value until the delay is actually up', () => {
    const { result, rerender } = renderDebounce('')

    rerender({ value: 'leanne' })
    act(() => void vi.advanceTimersByTime(499))
    expect(result.current).toBe('')

    act(() => void vi.advanceTimersByTime(1))
    expect(result.current).toBe('leanne')
  })

  it('settles once on the last value when someone types quickly', () => {
    const { result, rerender } = renderDebounce('')

    // Six keystrokes, 50 ms apart — nobody pauses for half a second mid-word.
    for (const value of ['l', 'le', 'lea', 'lean', 'leann', 'leanne']) {
      rerender({ value })
      act(() => void vi.advanceTimersByTime(50))
    }

    // 250 ms of typing has gone by and the filter has still not run once.
    expect(result.current).toBe('')

    act(() => void vi.advanceTimersByTime(500))
    expect(result.current).toBe('leanne')
  })

  it('restarts the clock on every keystroke rather than firing mid-word', () => {
    const { result, rerender } = renderDebounce('')

    rerender({ value: 'lea' })
    act(() => void vi.advanceTimersByTime(400))

    // One more keystroke at 400 ms: the pending timer is cancelled, so the
    // value does not land at 500 ms — it lands 500 ms after *this* key.
    rerender({ value: 'leanne' })
    act(() => void vi.advanceTimersByTime(400))
    expect(result.current).toBe('')

    act(() => void vi.advanceTimersByTime(100))
    expect(result.current).toBe('leanne')
  })

  it('debounces an empty box just like any other value', () => {
    const { result, rerender } = renderDebounce('leanne')

    rerender({ value: '' })
    expect(result.current).toBe('leanne')

    act(() => void vi.advanceTimersByTime(500))
    expect(result.current).toBe('')
  })

  it('leaves no timer pending when the component unmounts', () => {
    const { rerender, unmount } = renderDebounce('')

    rerender({ value: 'leanne' })
    expect(vi.getTimerCount()).toBe(1)

    unmount()

    // The cleanup, proved by its effect rather than by spying on
    // clearTimeout: nothing is left that could fire into a dead component.
    expect(vi.getTimerCount()).toBe(0)
  })
})
