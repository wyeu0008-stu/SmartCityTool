import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../apiClient'
import { recordRouteSearch } from '../popularityService'

vi.mock('../apiClient', () => ({
  apiRequest: vi.fn()
}))

describe('recordRouteSearch', () => {
  it('posts origin and destination to the popularity endpoint', async () => {
    apiRequest.mockResolvedValue({ record: { origin: 'Current Location', destination: 'Docklands' } })

    await recordRouteSearch({
      origin: { text: 'Current Location', lat: -37.8136, lng: 144.9631 },
      destination: { text: 'Docklands', lat: -37.8152, lng: 144.9483 }
    })

    expect(apiRequest).toHaveBeenCalledWith('/api/popularity/searches', {
      method: 'POST',
      body: JSON.stringify({
        origin: { text: 'Current Location', lat: -37.8136, lng: 144.9631 },
        destination: { text: 'Docklands', lat: -37.8152, lng: 144.9483 }
      })
    })
  })
})
