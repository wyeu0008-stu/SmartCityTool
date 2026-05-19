import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCyclingTips } from '../tipsService'

describe('fetchCyclingTips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('fetches cycling tips successfully', async () => {
    const mockTips = [
      {
        title: 'Start Small',
        text: 'Even a short ride can build confidence.',
        category: 'motivation'
      }
    ]

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ tips: mockTips })
    })

    const result = await fetchCyclingTips()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('/api/tips')
    expect(result).toEqual(mockTips)
  })

  it('returns an empty array when the response has no tips', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })

    await expect(fetchCyclingTips()).resolves.toEqual([])
  })

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false
    })

    await expect(fetchCyclingTips()).rejects.toThrow('Failed to fetch cycling tips')
  })
})
