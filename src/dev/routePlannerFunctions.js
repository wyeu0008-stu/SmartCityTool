export const ROUTE_MODES = ['safest', 'fastest', 'shortest']

export function normalizeRoute(route) {
  const score = Number(route.score || 0)
  const minutes = Number(route.minutes || 0)
  const riskWeight = Number(route.riskWeight || 0)
  const distanceKm = Number(route.distanceKm || 0)

  return {
    ...route,
    score,
    minutes,
    riskWeight,
    distanceKm,
    safetyRank: score * 10 - riskWeight * 8
  }
}

export function sortRoutesByMode(routes, mode = 'safest') {
  const normalized = routes.map(normalizeRoute)

  if (mode === 'fastest') {
    return normalized.sort((a, b) => a.minutes - b.minutes)
  }

  if (mode === 'shortest') {
    return normalized.sort((a, b) => a.distanceKm - b.distanceKm)
  }

  return normalized.sort((a, b) => b.safetyRank - a.safetyRank)
}

export function getRecommendedRoute(routes, mode = 'safest') {
  return sortRoutesByMode(routes, mode)[0] || null
}

export function filterRoutesBySafety(routes, minimumScore = 0) {
  return routes.map(normalizeRoute).filter((route) => route.score >= minimumScore)
}

export function buildRiskSummary(route) {
  if (!route) {
    return []
  }

  return [
    {
      label: 'Risk alerts',
      value: route.alerts?.length || 0
    },
    {
      label: 'Protected coverage',
      value: `${route.protectedLanePercent || 0}%`
    },
    {
      label: 'Estimated time',
      value: `${route.minutes} mins`
    }
  ]
}

export function createMapPlan(origin, destination, selectedRoute) {
  return {
    origin,
    destination,
    selectedRoute,
    layers: ['safe-routes', 'risk-areas', 'popular-routes'],
    generatedAt: new Date().toISOString()
  }
}
