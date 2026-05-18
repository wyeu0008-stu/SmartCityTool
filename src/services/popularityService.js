import { apiRequest } from './apiClient'

export async function recordRouteSearch({ origin, destination }) {
  return apiRequest('/api/popularity/searches', {
    method: 'POST',
    body: JSON.stringify({ origin, destination })
  })
}
