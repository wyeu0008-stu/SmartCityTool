export const devRouteOptions = [
  { id: 'a', name: 'Route A', label: 'Safest', score: 8.7, time: '17 mins', risk: 'Low', color: '#3c9d74' },
  { id: 'b', name: 'Route B', label: 'Fastest', score: 6.9, time: '15 mins', risk: 'High', color: '#3f74c9' },
  { id: 'c', name: 'Route C', label: 'Shortest', score: 6.1, time: '16 mins', risk: 'Medium', color: '#d4a62d' }
]

export const devInsightCards = [
  {
    title: 'Weather Fit',
    value: 'Good',
    detail: 'Preview build tracks stable cycling weather conditions.'
  },
  {
    title: 'Traffic Risk',
    value: 'Medium',
    detail: 'Test dataset still highlights heavier junction exposure.'
  },
  {
    title: 'Release Status',
    value: 'Preview',
    detail: 'Use this environment to validate UI and routing before release.'
  }
]

export const devPlannerLocations = [
  { id: 'current', name: 'Current Location', coords: [-37.8136, 144.9631] },
  { id: 'new-park', name: 'New Park', coords: [-37.8058, 144.9772] },
  { id: 'lakeside-trail', name: 'Lakeside Trail', coords: [-37.8217, 144.9956] },
  { id: 'docklands', name: 'Docklands', coords: [-37.8145, 144.9483] }
]

export const devRouteModes = [
  { id: 'safest', label: 'Safest' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'shortest', label: 'Shortest' }
]

export const devMapToggles = [
  { key: 'safeRoutes', label: 'Show Safe Routes', color: '#45a875' },
  { key: 'riskAreas', label: 'Show Risk Areas', color: '#dca43b' },
  { key: 'popularRoutes', label: 'Show Popular Routes', color: '#d76666' }
]

export const devPopularRoutes = [
  {
    id: 'lakeside',
    title: 'Lakeside Trail',
    subtitle: 'Preview traffic volume: 1,610 cyclists today',
    image: '/zhimai-zhang-Udc19wsFcPY-unsplash.jpg',
    coords: [-37.8217, 144.9956]
  },
  {
    id: 'safe-zone',
    title: 'Safe Zones',
    subtitle: 'Preview safe-zone overlay around New Park',
    image: '/tomi-vadasz-SBKJ47obEHY-unsplash.jpg',
    coords: [-37.8058, 144.9772]
  }
]

export const devRiskAlerts = {
  safest: [
    'Preview alert: intersection stress test',
    'Preview alert: rider count spike near Docklands'
  ],
  fastest: [
    'Preview alert: fewer protected lanes in test route',
    'Preview alert: faster route shares more vehicle lanes'
  ],
  shortest: [
    'Preview alert: narrow shared section in simulated path',
    'Preview alert: shorter route keeps moderate risk markers'
  ]
}

export const devRouteProfiles = {
  safest: {
    score: 8.7,
    time: '17 mins',
    routeType: 'Protected Lanes',
    subtitle: 'Preview route with strongest separated-lane coverage',
    color: '#3d9b72',
    path: [
      [-37.8136, 144.9631],
      [-37.8109, 144.9684],
      [-37.8087, 144.9728],
      [-37.8072, 144.9755],
      [-37.8058, 144.9772]
    ]
  },
  fastest: {
    score: 6.9,
    time: '15 mins',
    routeType: 'Mixed Road Access',
    subtitle: 'Preview route favoring travel time',
    color: '#3f74c9',
    path: [
      [-37.8136, 144.9631],
      [-37.813, 144.9678],
      [-37.8118, 144.9717],
      [-37.8096, 144.9759],
      [-37.8058, 144.9772]
    ]
  },
  shortest: {
    score: 6.1,
    time: '16 mins',
    routeType: 'Urban Shared Roads',
    subtitle: 'Preview shortest route for regression testing',
    color: '#d4a62d',
    path: [
      [-37.8136, 144.9631],
      [-37.8122, 144.9668],
      [-37.8102, 144.9708],
      [-37.8077, 144.9748],
      [-37.8058, 144.9772]
    ]
  }
}

export const devRiskPoints = [
  { id: 'risk-1', label: 'Preview stress point', coords: [-37.8111, 144.9702] },
  { id: 'risk-2', label: 'Preview merge zone', coords: [-37.8089, 144.9759] }
]

export const devSafeZones = [
  { id: 'safe-zone-1', label: 'Preview protected corridor', coords: [-37.8097, 144.9732], radius: 280 },
  { id: 'safe-zone-2', label: 'Preview New Park safe zone', coords: [-37.8058, 144.9772], radius: 220 }
]
