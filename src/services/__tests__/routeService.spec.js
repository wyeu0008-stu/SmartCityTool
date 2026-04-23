import { describe, expect, it, vi } from 'vitest'
import { fetchRoutes } from '../routeService'

describe('fetchRoutes', () => {
  it('returns mock route payload with origin and destination meta', async () => {
    vi.useFakeTimers()

    const promise = fetchRoutes({
      origin: 'Current Location',
      destination: 'New Park'
    })

    await vi.advanceTimersByTimeAsync(400)
    const result = await promise

    expect(result.recommended).toBeDefined()
    expect(result.routes).toHaveLength(3)
    expect(result.meta).toEqual({
      origin: 'Current Location',
      destination: 'New Park',
      source: 'mock'
    })

    vi.useRealTimers()
  })
})
