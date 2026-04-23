import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../apiClient'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('requests JSON with default headers', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    const result = await apiRequest('/status')

    expect(global.fetch).toHaveBeenCalledWith('/status', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    expect(result).toEqual({ success: true })
  })

  it('merges custom headers and options', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true })
    })

    await apiRequest('/routes', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer token'
      },
      body: '{"a":1}'
    })

    expect(global.fetch).toHaveBeenCalledWith('/routes', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token'
      },
      method: 'POST',
      body: '{"a":1}'
    })
  })

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 503
    })

    await expect(apiRequest('/fail')).rejects.toThrow('API request failed: 503')
  })
})
