import { apiRequest } from './apiClient'

function isPopularityApiEnabled() {
  return import.meta.env.VITE_USE_POPULARITY_API === 'true'
}

export async function recordRouteSearch({ origin, destination }) {
  if (!isPopularityApiEnabled()) {
    return {
      skipped: true,
      reason: 'Popularity API disabled'
    }
  }

  return apiRequest('/api/popularity/searches', {
    method: 'POST',
    body: JSON.stringify({ origin, destination })
  })
}

export async function fetchPopularitySummary(limit = 5) {
  if (!isPopularityApiEnabled()) {
    return {
      startPoints: [],
      endPoints: [],
      routes: []
    }
  }

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
