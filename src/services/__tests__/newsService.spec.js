import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTrafficNews } from '../newsService'

describe('fetchTrafficNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('fetches traffic news successfully', async () => {
    const mockNews = [
      {
        title: 'Cycling safety update',
        description: 'New cycling safety measures announced.',
        url: 'https://example.com/1',
        source: 'ABC News',
        publishedAt: '2026-04-17T10:00:00Z'
      }
    ]

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockNews
    })

    const result = await fetchTrafficNews()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith('/api/news/traffic')
    expect(result).toEqual(mockNews)
  })

  it('throws backend detail message when response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        detail: 'Backend service unavailable'
      })
    })

    await expect(fetchTrafficNews()).rejects.toThrow('Backend service unavailable')

    expect(global.fetch).toHaveBeenCalledWith('/api/news/traffic')
  })

  it('falls back to default error message when response json has no detail', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Something else failed'
      })
    })

    await expect(fetchTrafficNews()).rejects.toThrow('Failed to fetch traffic news')
  })

  it('falls back to default error message when response json parsing fails', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    await expect(fetchTrafficNews()).rejects.toThrow('Failed to fetch traffic news')
  })

  it('propagates fetch rejection errors', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    await expect(fetchTrafficNews()).rejects.toThrow('Network error')
  })

  it('returns an empty array when backend returns empty array', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    })

    const result = await fetchTrafficNews()

    expect(result).toEqual([])
  })
})