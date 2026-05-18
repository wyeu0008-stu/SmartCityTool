import { describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../apiClient'
import { fetchPopularitySummary, recordRouteSearch } from '../popularityService'

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

  it('fetches popular origins, destinations, and routes together', async () => {
    apiRequest
      .mockResolvedValueOnce({ start_points: [{ display_name: 'Origin A' }] })
      .mockResolvedValueOnce({ end_points: [{ display_name: 'Destination B' }] })
      .mockResolvedValueOnce({ routes: [{ origin_display_name: 'Origin A', destination_display_name: 'Destination B' }] })

    const summary = await fetchPopularitySummary(3)

    expect(apiRequest).toHaveBeenCalledWith('/api/popularity/start-points?limit=3')
    expect(apiRequest).toHaveBeenCalledWith('/api/popularity/end-points?limit=3')
    expect(apiRequest).toHaveBeenCalledWith('/api/popularity/routes?limit=3')
    expect(summary.startPoints).toHaveLength(1)
    expect(summary.endPoints).toHaveLength(1)
    expect(summary.routes).toHaveLength(1)
  })
})
