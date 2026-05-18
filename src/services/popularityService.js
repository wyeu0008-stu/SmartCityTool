import { apiRequest } from './apiClient'

export async function recordRouteSearch({ origin, destination }) {
  return apiRequest('/api/popularity/searches', {
    method: 'POST',
    body: JSON.stringify({ origin, destination })
  })
}

export async function fetchPopularitySummary(limit = 5) {
  const [startPoints, endPoints, routes] = await Promise.all([
    apiRequest(`/api/popularity/start-points?limit=${limit}`),
    apiRequest(`/api/popularity/end-points?limit=${limit}`),
    apiRequest(`/api/popularity/routes?limit=${limit}`)
  ])

  return {
    startPoints: startPoints.start_points || [],
    endPoints: endPoints.end_points || [],
    routes: routes.routes || []
  }
}
