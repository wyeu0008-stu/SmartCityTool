import { ROUTE_THEME } from '../constants/routeThemes'

export const mockRouteOptions = [
  {
    id: 1,
    key: 'safest',
    name: 'Route A (Safest)',
    routeType: 'Protected Lanes',
    score: 8.5,
    time: '18 mins',
    risk: 'Low',
    alerts: [
      { symbol: '⚠', text: 'High traffic area ahead', level: 'yellow' },
      { symbol: '⚠', text: 'Intersection with heavy traffic', level: 'yellow' },
      { symbol: '▲', text: 'Risk level comparison', level: 'red' }
    ],
    ...ROUTE_THEME.safest
  },
  {
    id: 2,
    key: 'fastest',
    name: 'Route B (Fastest)',
    routeType: 'Mixed Road Access',
    score: 6.7,
    time: '15 mins',
    risk: 'High',
    alerts: [
      { symbol: '⚠', text: 'Several busy junctions', level: 'yellow' },
      { symbol: '▲', text: 'Limited cycle lane coverage', level: 'red' }
    ],
    ...ROUTE_THEME.fastest
  },
  {
    id: 3,
    key: 'shortest',
    name: 'Route C (Shortest)',
    routeType: 'Urban Shared Roads',
    score: 5.8,
    time: '16 mins',
    risk: 'Medium',
    alerts: [
      { symbol: '⚠', text: 'Narrow lane sections', level: 'yellow' },
      { symbol: '▲', text: 'Moderate vehicle interaction', level: 'red' }
    ],
    ...ROUTE_THEME.shortest
  }
]