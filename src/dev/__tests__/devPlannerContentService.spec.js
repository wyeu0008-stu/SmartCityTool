import { describe, expect, it } from 'vitest'
import {
  devInsightCards,
  devMapToggles,
  devPlannerLocations,
  devPopularRoutes,
  devRiskAlerts,
  devRiskPoints,
  devRouteModes,
  devRouteOptions,
  devRouteProfiles,
  devSafeZones
} from '../services/devPlannerContentService'

describe('devPlannerContentService', () => {
  it('provides preview route options', () => {
    expect(devRouteOptions).toHaveLength(3)
    expect(devRouteOptions[0]).toMatchObject({
      label: 'Safest',
      score: 8.7
    })
  })

  it('provides planner locations and route modes', () => {
    expect(devPlannerLocations.map((item) => item.id)).toContain('current')
    expect(devRouteModes.map((item) => item.id)).toEqual(['safest', 'fastest', 'shortest'])
  })

  it('provides toggle, risk, and safe-zone content', () => {
    expect(devMapToggles).toHaveLength(3)
    expect(devRiskPoints).toHaveLength(2)
    expect(devSafeZones).toHaveLength(2)
    expect(devRiskAlerts.fastest[0]).toContain('Preview alert')
  })

  it('provides map profiles and popular routes', () => {
    expect(devPopularRoutes).toHaveLength(2)
    expect(devRouteProfiles.safest.path.length).toBeGreaterThan(2)
    expect(devRouteProfiles.fastest.routeType).toBe('Mixed Road Access')
  })

  it('provides dev insight cards', () => {
    expect(devInsightCards).toHaveLength(3)
    expect(devInsightCards[2].value).toBe('Preview')
  })
})
