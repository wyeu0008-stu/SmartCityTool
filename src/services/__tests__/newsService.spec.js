import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('fetchTrafficNews', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('throws an error when API key is missing', async () => {
    vi.stubEnv('VITE_GNEWS_API_KEY', '')

    const { fetchTrafficNews } = await import('../newsService')

    await expect(fetchTrafficNews()).rejects.toThrow('Missing GNews API key')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('throws an error when fetch response is not ok', async () => {
    vi.stubEnv('VITE_GNEWS_API_KEY', 'test-api-key')

    global.fetch.mockResolvedValue({
      ok: false
    })

    const { fetchTrafficNews } = await import('../newsService')

    await expect(fetchTrafficNews()).rejects.toThrow('Failed to fetch traffic news')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('returns mapped traffic news data correctly', async () => {
    vi.stubEnv('VITE_GNEWS_API_KEY', 'test-api-key')

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: [
          {
            title: 'Bike accident reported in Melbourne',
            description: 'A cycling crash caused delays.',
            url: 'https://example.com/article-1',
            source: { name: 'ABC News' },
            publishedAt: '2026-04-17T08:30:00Z'
          },
          {
            title: 'New cycling safety policy announced',
            description: 'Council released a new safety plan.',
            url: 'https://example.com/article-2',
            source: {},
            publishedAt: '2026-04-16T07:00:00Z'
          }
        ]
      })
    })

    const { fetchTrafficNews } = await import('../newsService')

    const result = await fetchTrafficNews()

    expect(global.fetch).toHaveBeenCalledTimes(1)

    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('https://gnews.io/api/v4/search')
    expect(calledUrl).toContain('lang=en')
    expect(calledUrl).toContain('max=5')
    expect(calledUrl).toContain('apikey=test-api-key')
    expect(calledUrl).toContain(encodeURIComponent('cycling safety OR bike accident'))

    expect(result).toEqual([
      {
        title: 'Bike accident reported in Melbourne',
        description: 'A cycling crash caused delays.',
        url: 'https://example.com/article-1',
        source: 'ABC News',
        publishedAt: '2026-04-17T08:30:00Z'
      },
      {
        title: 'New cycling safety policy announced',
        description: 'Council released a new safety plan.',
        url: 'https://example.com/article-2',
        source: 'Unknown source',
        publishedAt: '2026-04-16T07:00:00Z'
      }
    ])
  })

  it('returns an empty array when articles is missing', async () => {
    vi.stubEnv('VITE_GNEWS_API_KEY', 'test-api-key')

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    })

    const { fetchTrafficNews } = await import('../newsService')

    const result = await fetchTrafficNews()

    expect(result).toEqual([])
  })
})