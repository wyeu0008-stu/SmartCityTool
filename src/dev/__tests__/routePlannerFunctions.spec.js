import { describe, expect, it, vi } from 'vitest'
import {
  buildRiskSummary,
  createMapPlan,
  filterRoutesBySafety,
  getRecommendedRoute,
  normalizeRoute,
  sortRoutesByMode
} from '../routePlannerFunctions'

const routes = [
  {
    id: 'safe',
    score: 8.5,
    minutes: 18,
    distanceKm: 4.8,
    riskWeight: 1,
    protectedLanePercent: 82,
    alerts: ['Busy junction']
  },
  {
    id: 'fast',
    score: 6.7,
    minutes: 15,
    distanceKm: 5.1,
    riskWeight: 3,
    protectedLanePercent: 46,
    alerts: ['Traffic']
  },
  {
    id: 'short',
    score: 5.8,
    minutes: 16,
    distanceKm: 3.9,
    riskWeight: 4,
    protectedLanePercent: 38,
    alerts: []
  }
]

describe('routePlannerFunctions', () => {
  it('normalizes route values and computes safety rank', () => {
    const result = normalizeRoute({
      score: '8.5',
      minutes: '18',
      riskWeight: '1',
      distanceKm: '4.8'
    })

    expect(result.score).toBe(8.5)
    expect(result.minutes).toBe(18)
    expect(result.riskWeight).toBe(1)
    expect(result.distanceKm).toBe(4.8)
    expect(result.safetyRank).toBe(77)
  })

  it('sorts routes by safest mode', () => {
    const result = sortRoutesByMode(routes, 'safest')

    expect(result.map((route) => route.id)).toEqual(['safe', 'fast', 'short'])
  })

  it('sorts routes by fastest mode', () => {
    const result = sortRoutesByMode(routes, 'fastest')

    expect(result.map((route) => route.id)).toEqual(['fast', 'short', 'safe'])
  })

  it('sorts routes by shortest mode', () => {
    const result = sortRoutesByMode(routes, 'shortest')

    expect(result.map((route) => route.id)).toEqual(['short', 'safe', 'fast'])
  })

  it('returns the recommended route for a mode', () => {
    expect(getRecommendedRoute(routes, 'safest').id).toBe('safe')
    expect(getRecommendedRoute(routes, 'fastest').id).toBe('fast')
  })

  it('filters routes by minimum safety score', () => {
    const result = filterRoutesBySafety(routes, 6)

    expect(result.map((route) => route.id)).toEqual(['safe', 'fast'])
  })

  it('builds a risk summary for a route', () => {
    const result = buildRiskSummary(routes[0])

    expect(result).toEqual([
      { label: 'Risk alerts', value: 1 },
      { label: 'Protected coverage', value: '82%' },
      { label: 'Estimated time', value: '18 mins' }
    ])
  })

  it('returns an empty summary when there is no route', () => {
    expect(buildRiskSummary(null)).toEqual([])
  })

  it('creates a map plan with timestamp and layers', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-24T10:00:00Z'))

    const result = createMapPlan('A', 'B', routes[0])

    expect(result).toEqual({
      origin: 'A',
      destination: 'B',
      selectedRoute: routes[0],
      layers: ['safe-routes', 'risk-areas', 'popular-routes'],
      generatedAt: '2026-04-24T10:00:00.000Z'
    })

    vi.useRealTimers()
  })
})
