export const plannerLocations = [
  {
    id: 'current',
    name: 'Current Location',
    coords: [-37.8136, 144.9631]
  },
  {
    id: 'new-park',
    name: 'New Park',
    coords: [-37.8058, 144.9772]
  },
  {
    id: 'lakeside-trail',
    name: 'Lakeside Trail',
    coords: [-37.8217, 144.9956]
  },
  {
    id: 'docklands',
    name: 'Docklands',
    coords: [-37.8145, 144.9483]
  }
]

export const releaseRouteModes = [
  { id: 'safest', label: 'Safest' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'shortest', label: 'Shortest' }
]

export const releaseMapToggles = [
  { key: 'safeRoutes', label: 'Show Safe Routes', color: '#45a875' },
  { key: 'riskAreas', label: 'Show Risk Areas', color: '#dca43b' },
  { key: 'popularRoutes', label: 'Show Popular Routes', color: '#d76666' }
]

export const releasePopularRoutes = [
  {
    id: 'lakeside',
    title: 'Lakeside Trail',
    subtitle: '1,530 cyclists today',
    image: '/zhimai-zhang-Udc19wsFcPY-unsplash.jpg',
    coords: [-37.8217, 144.9956]
  },
  {
    id: 'safe-zone',
    title: 'Safe Zones',
    subtitle: 'New Park is one of the safest areas for cycling',
    image: '/tomi-vadasz-SBKJ47obEHY-unsplash.jpg',
    coords: [-37.8058, 144.9772]
  }
]

export const releaseRiskAlerts = {
  safest: [
    'High traffic area ahead',
    'Busy intersection near Docklands'
  ],
  fastest: [
    'Fewer protected lanes through the centre',
    'Higher vehicle mix approaching Docklands'
  ],
  shortest: [
    'Narrow shared section near river crossing',
    'Moderate conflict at local access road'
  ]
}

export const releaseRouteProfiles = {
  safest: {
    score: 8.5,
    time: '18 mins',
    routeType: 'Protected Lanes',
    subtitle: 'Best separated cycling coverage',
    color: '#3d9b72',
    path: [
      [-37.8136, 144.9631],
      [-37.8102, 144.9689],
      [-37.8083, 144.9724],
      [-37.8068, 144.9753],
      [-37.8058, 144.9772]
    ]
  },
  fastest: {
    score: 6.7,
    time: '15 mins',
    routeType: 'Mixed Road Access',
    subtitle: 'Lower time, more junction exposure',
    color: '#3f74c9',
    path: [
      [-37.8136, 144.9631],
      [-37.8129, 144.9682],
      [-37.8118, 144.9726],
      [-37.8097, 144.9765],
      [-37.8058, 144.9772]
    ]
  },
  shortest: {
    score: 5.8,
    time: '16 mins',
    routeType: 'Urban Shared Roads',
    subtitle: 'Shortest distance with tighter streets',
    color: '#d4a62d',
    path: [
      [-37.8136, 144.9631],
      [-37.8121, 144.9664],
      [-37.8105, 144.9712],
      [-37.8077, 144.9746],
      [-37.8058, 144.9772]
    ]
  }
}

export const releaseRiskPoints = [
  {
    id: 'risk-1',
    label: 'Busy signalized crossing',
    coords: [-37.8113, 144.9706]
  },
  {
    id: 'risk-2',
    label: 'Vehicle merging area',
    coords: [-37.8088, 144.9755]
  }
]

export const releaseSafeZones = [
  {
    id: 'safe-zone-1',
    label: 'Protected lane corridor',
    coords: [-37.8097, 144.9732],
    radius: 280
  },
  {
    id: 'safe-zone-2',
    label: 'New Park safe zone',
    coords: [-37.8058, 144.9772],
    radius: 220
  }
]
