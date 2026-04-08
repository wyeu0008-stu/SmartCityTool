import { mockRouteOptions } from '../data/mockRoutes'
import { apiRequest } from './apiClient'

const USE_MOCK = true

export async function fetchRoutes({ origin, destination }) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      recommended: mockRouteOptions[0],
      routes: mockRouteOptions,
      meta: {
        origin,
        destination,
        source: 'mock'
      }
    }
  }

  return apiRequest('/routes/search', {
    method: 'POST',
    body: JSON.stringify({ origin, destination })
  })
}