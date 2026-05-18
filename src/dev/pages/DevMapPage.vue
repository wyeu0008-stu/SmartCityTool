<script setup>
/* c8 ignore file */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  plannerLocations,
  releaseMapToggles,
  releasePopularRoutes,
  releaseRiskAlerts,
  releaseRiskPoints,
  releaseRouteModes,
  releaseRouteProfiles,
  releaseSafeZones
} from '../../Release/data/releaseMapData'
import { recordRouteSearch } from '../../services/popularityService'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const USE_MODEL_ROUTES = import.meta.env.VITE_USE_MODEL_ROUTES === 'true'
const MELBOURNE_CITY_BOUNDS = {
  south: -37.855,
  west: 144.895,
  north: -37.775,
  east: 145.015
}
const MELBOURNE_CITY_CENTER = [-37.8136, 144.9631]

function goToDevHome() {
  router.push('/dev/home')
}

function goToDevMap() {
  router.push('/dev/map')
}

function goToDevInsights() {
  router.push('/dev/safety-insights')
}
const activeMode = ref('safest')
const originQuery = ref('Current Location')
const destinationQuery = ref('')
const selectedDestinationId = ref('')
const customDestination = ref(null)
const selectedStops = ref([])
const locationWarning = ref('')
const roadRouteOptions = ref({
  safest: [],
  fastest: [],
  shortest: []
})
const routeStats = ref({
  safest: null,
  fastest: null,
  shortest: null
})
const DEFAULT_ACTIVE_TOGGLES = ['safeRoutes', 'bikeLanes']
const activeToggles = ref([...DEFAULT_ACTIVE_TOGGLES])
const showLayerControls = ref(false)
const showRouteDetails = ref(false)
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const navigationStarted = ref(false)
const routeVisuals = {
  safest: {
    color: '#34c759',
    halo: '#ffffff',
    label: 'Safest'
  },
  fastest: {
    color: '#007aff',
    halo: '#ffffff',
    label: 'Fastest'
  },
  shortest: {
    color: '#ff9f0a',
    halo: '#ffffff',
    label: 'Shortest'
  }
}
const mapToggles = computed(() => [
  { key: 'safeRoutes', label: 'Show Route', color: '#45a875' },
  { key: 'bikeLanes', label: 'Show Dedicated Bike Lanes', color: '#00c7be' },
  { key: 'bikeParking', label: 'Show Nearby Bike Parking', color: '#1f4e79' },
  { key: 'toilets', label: 'Show Nearby Toilets', color: '#8b5cf6' },
  { key: 'water', label: 'Show Nearby Water', color: '#0ea5e9' }
])

const mapContainer = ref(null)
let map
let routeLayer
let arrowLayer
let safeZonesLayer
let riskLayer
let popularLayer
let parkingLayer
let bikeLaneLayer
let toiletLayer
let waterLayer
let cityBoundaryLayer
let startMarker
let stopMarkers = []
let destinationMarker
function getStopKey(stop) {
  return `${stop.type}-${stop.coords[0]}-${stop.coords[1]}`
}

function addRouteStop(stop) {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    showLocationWarning('Search a destination before adding a stop.')
    return
  }

  const stopKey = getStopKey(stop)
  const alreadyAdded = selectedStops.value.some((item) => getStopKey(item) === stopKey)

  if (!alreadyAdded) {
    selectedStops.value = [...selectedStops.value, stop]
    navigationStarted.value = false
  }

  refreshRoadRoute()
}

function removeRouteStop(stopToRemove) {
  const stopKey = getStopKey(stopToRemove)
  selectedStops.value = selectedStops.value.filter((stop) => getStopKey(stop) !== stopKey)
  navigationStarted.value = false
  refreshRoadRoute()
}

function clearRouteStops() {
  selectedStops.value = []
  navigationStarted.value = false
  refreshRoadRoute()
}

function createStopPopup(stop, distanceM, extraLine = '') {
  const stopData = encodeURIComponent(JSON.stringify(stop))
  const extraContent = extraLine ? `${extraLine}<br/>` : ''

  return `
    <strong>${stop.name}</strong><br/>
    ${extraContent}📍 Distance: ${distanceM}m<br/>
    <button class="add-stop-popup-button" data-stop="${stopData}">Add as stop</button>
  `
}

function bindAddStopPopup(marker, stop, distanceM, extraLine = '') {
  marker.bindPopup(createStopPopup(stop, distanceM, extraLine))

  marker.on?.('popupopen', (event) => {
    const popupElement = event.popup?.getElement?.()
    const button = popupElement?.querySelector?.('.add-stop-popup-button')

    button?.addEventListener('click', () => {
      const stopPayload = button.getAttribute('data-stop')
      if (!stopPayload) return

      addRouteStop(JSON.parse(decodeURIComponent(stopPayload)))
      map.closePopup?.()
    }, { once: true })
  })
}

const currentLocation = plannerLocations.find((location) => location.id === 'current')
const userCurrentCoords = ref(currentLocation.coords)
const isUsingRealLocation = ref(false)

const destinationOptions = computed(() =>
  plannerLocations.filter((location) =>
    location.id !== 'current' && location.name.toLowerCase() !== 'new park'
  )
)

const popularOriginSuggestions = [
  { id: 'origin-lakeside-trail', name: 'Lakeside Trail', coords: [-37.8112, 144.9678] },
  { id: 'origin-docklands', name: 'Docklands', coords: [-37.8152, 144.9483] },
  { id: 'origin-state-library', name: 'State Library Victoria', coords: [-37.8098, 144.9652] },
  { id: 'origin-mcg', name: 'Melbourne Cricket Ground', coords: [-37.8199, 144.9834] },
  { id: 'origin-carlton-gardens', name: 'Carlton Gardens', coords: [-37.8063, 144.9717] },
  { id: 'origin-flagstaff-station', name: 'Flagstaff Station', coords: [-37.8119, 144.9557] }
]

const popularDestinationSuggestions = [
  { id: 'suggest-state-library', name: 'State Library Victoria', coords: [-37.8098, 144.9652] },
  { id: 'suggest-mcg', name: 'Melbourne Cricket Ground', coords: [-37.8199, 144.9834] },
  { id: 'suggest-docklands', name: 'Docklands', coords: [-37.8152, 144.9483] },
  { id: 'suggest-carlton-gardens', name: 'Carlton Gardens', coords: [-37.8063, 144.9717] },
  { id: 'suggest-flagstaff-station', name: 'Flagstaff Station', coords: [-37.8119, 144.9557] },
  { id: 'suggest-flagstaff', name: 'Flagstaff Gardens', coords: [-37.8101, 144.9544] },
  { id: 'suggest-queen-victoria-market', name: 'Queen Victoria Market', coords: [-37.8076, 144.9568] },
  { id: 'suggest-southbank', name: 'Southbank', coords: [-37.8217, 144.9646] }
]

const destinationSuggestionPool = computed(() => {
  const mergedLocations = [...destinationOptions.value, ...popularDestinationSuggestions]
  const seenNames = new Set()

  return mergedLocations.filter((location) => {
    const nameKey = location.name.toLowerCase()

    if (seenNames.has(nameKey)) {
      return false
    }

    seenNames.add(nameKey)
    return true
  })
})

const originSuggestionPool = computed(() => {
  const mergedLocations = [currentLocation, ...popularOriginSuggestions, ...destinationOptions.value]
  const seenNames = new Set()

  return mergedLocations.filter((location) => {
    const nameKey = location.name.toLowerCase()

    if (seenNames.has(nameKey)) {
      return false
    }

    seenNames.add(nameKey)
    return true
  })
})

const filteredOrigins = computed(() => {
  const query = originQuery.value.trim().toLowerCase()

  if (!query || query === 'current location') {
    return originSuggestionPool.value.slice(0, 6)
  }

  return originSuggestionPool.value
    .filter((location) => location.name.toLowerCase().includes(query))
    .slice(0, 6)
})

const filteredDestinations = computed(() => {
  const query = destinationQuery.value.trim().toLowerCase()

  if (!query) {
    return destinationSuggestionPool.value.slice(0, 6)
  }

  return destinationSuggestionPool.value
    .filter((location) => location.name.toLowerCase().includes(query))
    .slice(0, 6)
})

const selectedDestination = computed(() => {
  return customDestination.value || destinationOptions.value.find((location) => location.id === selectedDestinationId.value) || null
})

const activeProfile = computed(() => releaseRouteProfiles[activeMode.value])
const activeRouteVisual = computed(() => routeVisuals[activeMode.value] || routeVisuals.safest)

const activeAlerts = computed(() => releaseRiskAlerts[activeMode.value] || [])

const plannerSummary = computed(() => {
  const stats = routeStats.value[activeMode.value]

  return {
    score: stats?.safetyScore ?? activeProfile.value.score,
    time: stats ? `${stats.durationMin} mins` : activeProfile.value.time,
    distance: stats ? `${stats.distanceKm} km` : '',
    routeType: stats?.routeTypeLabel || activeProfile.value.routeType,
    subtitle: stats?.explanation || activeProfile.value.subtitle
  }
})

const routeSafetyProfile = computed(() => {
  const score = Number(plannerSummary.value.score || 0)
  const normalizedScore = score > 10 ? score : score * 10
  const riskLevel = normalizedScore >= 75
    ? 'Low risk'
    : normalizedScore >= 55
      ? 'Moderate risk'
      : 'Higher caution'
  const modeDescriptions = {
    safest: 'Prioritises lower predicted segment risk and stronger cycling infrastructure, even when the route is slightly longer.',
    fastest: 'Prioritises travel time, so the route may use busier streets or mixed-traffic links where cycling exposure is higher.',
    shortest: 'Prioritises directness, which can introduce tighter streets, intersections, and less consistent bike-lane coverage.'
  }
  const modeFeatures = {
    safest: ['Protected-lane preference', 'Lower average risk', 'Comfort first'],
    fastest: ['Time efficient', 'More direct links', 'Traffic-aware caution'],
    shortest: ['Compact distance', 'Urban shortcuts', 'Intersection checks']
  }

  return {
    riskLevel,
    normalizedScore: Math.max(0, Math.min(100, Math.round(normalizedScore))),
    description: modeDescriptions[activeMode.value] || modeDescriptions.safest,
    features: modeFeatures[activeMode.value] || modeFeatures.safest,
    modelNote: plannerSummary.value.subtitle || 'Safety is estimated from road-segment features, route geometry, and predicted risk.'
  }
})

const displayRoutePath = computed(() => [
  userCurrentCoords.value,
  selectedDestination.value?.coords || MELBOURNE_CITY_CENTER
])

const routePathToDraw = computed(() => {
  const activeRoute = roadRouteOptions.value[activeMode.value]
  return activeRoute?.length ? activeRoute : displayRoutePath.value
})

const availableRouteCount = computed(() => {
  const uniqueRoutes = new Set(
    Object.values(roadRouteOptions.value)
      .filter((path) => path.length > 0)
      .map((path) => JSON.stringify(path.slice(0, 8)))
  )

  return uniqueRoutes.size
})

const availableRouteModes = computed(() =>
  releaseRouteModes.filter((mode) => roadRouteOptions.value[mode.id]?.length)
)

const usingModelRoutes = computed(() => USE_MODEL_ROUTES && Object.values(routeStats.value).some(Boolean))

function hasToggle(toggleKey) {
  return activeToggles.value.includes(toggleKey)
}

function toggleLayer(toggleKey) {
  if (hasToggle(toggleKey)) {
    activeToggles.value = activeToggles.value.filter((key) => key !== toggleKey)

    if (toggleKey === 'bikeParking' && parkingLayer) {
      map.removeLayer(parkingLayer)
      parkingLayer = null
    }

    if (toggleKey === 'bikeLanes' && bikeLaneLayer) {
      map.removeLayer(bikeLaneLayer)
      bikeLaneLayer = null
    }

    if (toggleKey === 'toilets' && toiletLayer) {
      map.removeLayer(toiletLayer)
      toiletLayer = null
    }

    if (toggleKey === 'water' && waterLayer) {
      map.removeLayer(waterLayer)
      waterLayer = null
    }

    return
  }

  activeToggles.value = [...activeToggles.value, toggleKey]

  if (toggleKey === 'bikeParking') {
    showNearestBikeParking(userCurrentCoords.value)
  }

  if (toggleKey === 'bikeLanes') {
    showDedicatedBikeLanes()
  }

  if (toggleKey === 'toilets') {
    showNearbyFacilities('toilets', userCurrentCoords.value)
  }

  if (toggleKey === 'water') {
    showNearbyFacilities('water', userCurrentCoords.value)
  }
}
function createFacilityMarker(type) {
  const markerLabel = type === 'toilets' ? 'T' : 'W'
  const markerClass = type === 'toilets' ? 'is-toilet' : 'is-water'

  return createHtmlMarker(markerLabel, markerClass)
}

function isWithinMelbourneCity(coords) {
  const [lat, lng] = coords

  return lat >= MELBOURNE_CITY_BOUNDS.south &&
    lat <= MELBOURNE_CITY_BOUNDS.north &&
    lng >= MELBOURNE_CITY_BOUNDS.west &&
    lng <= MELBOURNE_CITY_BOUNDS.east
}

function showLocationWarning(message) {
  locationWarning.value = message
  alert(message)
}

function clearLocationWarning() {
  locationWarning.value = ''
}

async function chooseOrigin(location) {
  if (!isWithinMelbourneCity(location.coords)) {
    showLocationWarning('This start point is outside the supported Melbourne city routing area.')
    return
  }

  clearLocationWarning()
  originQuery.value = location.name
  userCurrentCoords.value = location.coords
  isUsingRealLocation.value = location.id === 'current'
  navigationStarted.value = false
  showOriginSuggestions.value = false
  await refreshRoadRoute()
}

async function geocodeMelbournePlace(rawQuery) {
  const searchText = `${rawQuery}, Melbourne, Australia`
  const viewbox = [
    MELBOURNE_CITY_BOUNDS.west,
    MELBOURNE_CITY_BOUNDS.north,
    MELBOURNE_CITY_BOUNDS.east,
    MELBOURNE_CITY_BOUNDS.south
  ].join(',')
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&viewbox=${viewbox}&q=${encodeURIComponent(searchText)}`
  )
  const results = await response.json()
  const firstResult = results[0]

  if (!firstResult) {
    return null
  }

  return {
    name: firstResult.display_name?.split(',')[0] || rawQuery,
    coords: [Number(firstResult.lat), Number(firstResult.lon)]
  }
}

async function resolveOriginInput() {
  const rawQuery = originQuery.value.trim()

  if (!rawQuery || rawQuery.toLowerCase() === 'current location') {
    if (!isWithinMelbourneCity(userCurrentCoords.value)) {
      throw new Error('Your current start point is outside the supported Melbourne city routing area.')
    }

    return
  }

  const matchedOrigin = plannerLocations.find((location) =>
    location.name.toLowerCase() === rawQuery.toLowerCase()
  ) || plannerLocations.find((location) =>
    location.name.toLowerCase().includes(rawQuery.toLowerCase())
  )

  const resolvedOrigin = matchedOrigin || await geocodeMelbournePlace(rawQuery)

  if (!resolvedOrigin) {
    throw new Error('Cannot find this start point in Melbourne city.')
  }

  if (!isWithinMelbourneCity(resolvedOrigin.coords)) {
    throw new Error('The start point is outside the supported Melbourne city routing area.')
  }

  originQuery.value = resolvedOrigin.name
  userCurrentCoords.value = resolvedOrigin.coords
  isUsingRealLocation.value = false
}

function showNearbyFacilities(type, userCoords) {
  const [lat, lng] = destinationQuery.value.trim() && selectedDestination.value?.coords
    ? getRouteSearchCenter()
    : userCoords
  const queryTag = type === 'toilets'
    ? 'node["amenity"="toilets"]'
    : 'node["amenity"="drinking_water"]'

  const query = `
    [out:json][timeout:12];
    (
      ${queryTag}(around:850,${lat},${lng});
    );
    out center 20;
  `

  fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  })
    .then((res) => res.json())
    .then((data) => {
      const facilities = (data.elements || [])
        .filter((item) => item.lat && item.lon)
        .filter((item) => !destinationQuery.value.trim() || isNearCurrentRoute(item.lat, item.lon))
        .sort((a, b) => getDistanceToCurrentRouteKm(a.lat, a.lon) - getDistanceToCurrentRouteKm(b.lat, b.lon))
        .slice(0, 7)

      if (type === 'toilets' && toiletLayer) {
        map.removeLayer(toiletLayer)
      }

      if (type === 'water' && waterLayer) {
        map.removeLayer(waterLayer)
      }

      const layer = L.layerGroup(
        facilities.map((item) => {
          const name = item.tags?.name || (type === 'toilets' ? 'Public Toilet' : 'Drinking Water')
          const distanceM = Math.round(getDistanceToCurrentRouteKm(item.lat, item.lon) * 1000)

          const stop = {
            name,
            type,
            coords: [item.lat, item.lon]
          }
          const marker = L.marker([item.lat, item.lon], {
            icon: createFacilityMarker(type)
          })

          bindAddStopPopup(marker, stop, distanceM)

          return marker
        })
      ).addTo(map)

      if (type === 'toilets') {
        toiletLayer = layer
      } else {
        waterLayer = layer
      }
    })
    .catch(() => {
      if (type === 'toilets') {
        toiletLayer = null
      }

      if (type === 'water') {
        waterLayer = null
      }
    })
}

async function chooseDestination(location) {
  if (!isWithinMelbourneCity(location.coords)) {
    showLocationWarning('This destination is outside the supported Melbourne city routing area.')
    return
  }

  clearLocationWarning()
  customDestination.value = null
  selectedStops.value = []
  navigationStarted.value = false
  destinationQuery.value = location.name
  selectedDestinationId.value = location.id
  activeToggles.value = [...DEFAULT_ACTIVE_TOGGLES]
  showDestinationSuggestions.value = false
  await refreshRoadRoute()
  await recordCurrentRouteSearch()
}

async function searchDestination() {
  await searchRoute()
}

async function searchRoute() {
  const rawQuery = destinationQuery.value.trim()
  const query = rawQuery.toLowerCase()

  if (!query) {
    return
  }

  try {
    await resolveOriginInput()

    const matchedDestination = destinationOptions.value.find((location) =>
      location.name.toLowerCase() === query
    ) || destinationOptions.value.find((location) =>
      location.name.toLowerCase().includes(query)
    )
    const resolvedDestination = matchedDestination || await geocodeMelbournePlace(rawQuery)

    if (!resolvedDestination) {
      alert('Cannot find this destination on the map')
      return
    }

    if (!isWithinMelbourneCity(resolvedDestination.coords)) {
      showLocationWarning('The destination is outside the supported Melbourne city routing area.')
      return
    }

    clearLocationWarning()
    selectedStops.value = []
    navigationStarted.value = false
    customDestination.value = {
      id: 'custom-destination',
      name: resolvedDestination.name,
      coords: resolvedDestination.coords
    }
    selectedDestinationId.value = matchedDestination?.id || 'custom-destination'
    destinationQuery.value = rawQuery
    activeToggles.value = [...DEFAULT_ACTIVE_TOGGLES]
    showDestinationSuggestions.value = false
    await refreshRoadRoute()
    await recordCurrentRouteSearch()
  } catch (error) {
    showLocationWarning(error.message || 'Unable to search this route right now')
  }
}
function startNavigation() {
  if (!selectedDestination.value?.coords) {
    showLocationWarning('Search a destination before starting navigation.')
    return
  }

  navigationStarted.value = true
  showRouteDetails.value = false
  updateMapScene()
  focusDestination(selectedDestination.value.coords)
}

function stopNavigation() {
  navigationStarted.value = false
  updateMapScene()
}

function getRouteBearing(startPoint, endPoint) {
  const [startLat, startLng] = startPoint.map(Number)
  const [endLat, endLng] = endPoint.map(Number)
  const startLatRad = startLat * Math.PI / 180
  const endLatRad = endLat * Math.PI / 180
  const lngDiffRad = (endLng - startLng) * Math.PI / 180
  const y = Math.sin(lngDiffRad) * Math.cos(endLatRad)
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(lngDiffRad)

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function buildNavigationArrows() {
  if (!navigationStarted.value || routePathToDraw.value.length < 3) {
    arrowLayer = L.layerGroup([])
    return
  }

  const path = routePathToDraw.value
  const arrowStep = Math.max(18, Math.ceil(path.length / 6))
  const arrowMarkers = path
    .map((point, index) => ({ point, index }))
    .filter(({ index }) => index > 0 && index < path.length - 8 && index % arrowStep === 0)
    .map(({ point, index }) => {
      const nextPoint = path[Math.min(index + 6, path.length - 1)]
      const bearing = getRouteBearing(point, nextPoint) - 90

      return L.marker(point, {
        icon: L.divIcon({
          className: 'navigation-arrow-wrapper',
          html: `<div class="navigation-arrow" style="transform: rotate(${bearing}deg)">➤</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }),
        interactive: false
      })
    })

  arrowLayer = L.layerGroup(arrowMarkers).addTo(map)
}

function applyDestinationFromQuery() {
  const queryDestination = typeof route?.query?.destination === 'string'
    ? route.query.destination.trim()
    : ''

  if (!queryDestination) {
    return
  }

  const matchedDestination = destinationOptions.value.find((location) =>
    location.name.toLowerCase() === queryDestination.toLowerCase()
  ) || destinationOptions.value.find((location) =>
    location.name.toLowerCase().includes(queryDestination.toLowerCase())
  )

  if (matchedDestination) {
    customDestination.value = null
    destinationQuery.value = matchedDestination.name
    selectedDestinationId.value = matchedDestination.id
    activeToggles.value = [...DEFAULT_ACTIVE_TOGGLES]
    return
  }

  destinationQuery.value = queryDestination
  activeToggles.value = [...DEFAULT_ACTIVE_TOGGLES]
}

function resetRouteResults() {
  roadRouteOptions.value = {
    safest: [],
    fastest: [],
    shortest: []
  }
  routeStats.value = {
    safest: null,
    fastest: null,
    shortest: null
  }
}

function normalizeSafetyScore(score) {
  const numericScore = Number(score)

  if (!Number.isFinite(numericScore)) {
    return null
  }

  return numericScore > 10
    ? Number((numericScore / 10).toFixed(1))
    : Number(numericScore.toFixed(1))
}

function routeTypeLabel(routeType) {
  if (routeType === 'safest') return 'Safest Route'
  if (routeType === 'fastest') return 'Fastest Route'
  if (routeType === 'shortest') return 'Shortest Route'
  return routeType || 'Route'
}

function getRouteColor(routeType) {
  return routeVisuals[routeType]?.color || '#007aff'
}

function toLeafletPath(pathCoordinates = []) {
  return pathCoordinates
    .filter((point) => Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng)))
    .map((point) => [Number(point.lat), Number(point.lng)])
}

function logRouteWarnings(warnings = []) {
  warnings
    .filter(Boolean)
    .forEach((warning) => {
      console.warn('[SmartCycle route]', warning)
    })
}

async function recordCurrentRouteSearch() {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    return
  }

  const [originLat, originLng] = userCurrentCoords.value
  const [destinationLat, destinationLng] = selectedDestination.value.coords

  try {
    await recordRouteSearch({
      origin: {
        text: originQuery.value.trim() || 'Current Location',
        lat: originLat,
        lng: originLng
      },
      destination: {
        text: selectedDestination.value.name || destinationQuery.value.trim(),
        lat: destinationLat,
        lng: destinationLng
      }
    })
  } catch (error) {
    logRouteWarnings([
      error?.message || 'Unable to record route search popularity.'
    ])
  }
}

function applyBackendRoutes(data, geometryOverride = null) {
  const nextRouteOptions = {
    safest: [],
    fastest: [],
    shortest: []
  }
  const nextRouteStats = {
    safest: null,
    fastest: null,
    shortest: null
  }

  ;(data.routes || []).forEach((routeItem) => {
    const rawRouteType = String(routeItem.route_type || '').toLowerCase()
    const routeType = rawRouteType === 'balanced' ? 'shortest' : rawRouteType

    if (!nextRouteOptions[routeType]) {
      return
    }

    const overrideStats = geometryOverride?.stats?.[routeType]
    const path = geometryOverride?.options?.[routeType]?.length
      ? geometryOverride.options[routeType]
      : toLeafletPath(routeItem.path_coordinates)
    nextRouteOptions[routeType] = path
    nextRouteStats[routeType] = {
      distanceKm: overrideStats?.distanceKm ?? Number((Number(routeItem.total_distance_m || 0) / 1000).toFixed(1)),
      durationMin: overrideStats?.durationMin ?? Math.max(1, Math.round(Number(routeItem.estimated_duration_min || 0))),
      safetyScore: normalizeSafetyScore(routeItem.safety_score),
      routeTypeLabel: routeTypeLabel(routeType),
      explanation: routeItem.explanation,
      partialSegmentGeometry: Boolean(routeItem.partial_segment_geometry)
    }
  })

  if (!Object.values(nextRouteOptions).some((path) => path.length)) {
    throw new Error('Backend route response did not include drawable geometry.')
  }

  roadRouteOptions.value = nextRouteOptions
  routeStats.value = nextRouteStats
  logRouteWarnings(data.warnings || [])

  if (!nextRouteOptions[activeMode.value]?.length) {
    activeMode.value = nextRouteOptions.safest.length
      ? 'safest'
      : Object.keys(nextRouteOptions).find((key) => nextRouteOptions[key].length) || 'safest'
  }
}

async function loadModelRoadRoute() {
  const [startLat, startLng] = userCurrentCoords.value
  const [endLat, endLng] = selectedDestination.value.coords

  const response = await fetch(`${API_BASE_URL}/api/routes/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      origin: {
        text: isUsingRealLocation.value ? 'Current location' : currentLocation.name,
        lat: startLat,
        lng: startLng
      },
      destination: {
        text: selectedDestination.value.name,
        lat: endLat,
        lng: endLng
      },
      mode: 'cycling'
    })
  })

  if (!response.ok) {
    let detail = ''

    try {
      const errorPayload = await response.json()
      detail = errorPayload?.detail ? ` ${errorPayload.detail}` : ''
    } catch {
      detail = ''
    }

    throw new Error(`Backend route API failed: ${response.status}.${detail}`)
  }

  const backendRoutes = await response.json()
  let liveGeometry = null

  try {
    liveGeometry = await fetchOsrmRouteOptions()
  } catch (error) {
    logRouteWarnings([
      'Live route geometry unavailable; using database candidate route geometry.',
      error?.message
    ])
  }

  applyBackendRoutes(backendRoutes, liveGeometry)
}

async function loadRoadRoute() {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    resetRouteResults()
    return
  }

  if (USE_MODEL_ROUTES) {
    try {
      await loadModelRoadRoute()
      return
    } catch (error) {
      await loadOsrmRoadRoute()
      logRouteWarnings([
        error?.message || 'Backend route API unavailable.',
        'Using existing route fallback.'
      ])
      return
    }
  }

  await loadOsrmRoadRoute()
}

async function fetchOsrmRouteOptions() {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    return null
  }

  const [startLat, startLng] = userCurrentCoords.value
  const [endLat, endLng] = selectedDestination.value.coords
  const stopCoordinates = selectedStops.value
    .map((stop) => `${stop.coords[1]},${stop.coords[0]}`)
    .join(';')
  const routeCoordinates = stopCoordinates
    ? `${startLng},${startLat};${stopCoordinates};${endLng},${endLat}`
    : `${startLng},${startLat};${endLng},${endLat}`

  const routeServiceUrls = [
    `https://router.project-osrm.org/route/v1/driving/${routeCoordinates}?overview=full&geometries=geojson&alternatives=3`,
    `https://routing.openstreetmap.de/routed-bike/route/v1/bike/${routeCoordinates}?overview=full&geometries=geojson&alternatives=3`,
    `https://router.project-osrm.org/route/v1/foot/${routeCoordinates}?overview=full&geometries=geojson&alternatives=3`
  ]
  let data = null

  for (const serviceUrl of routeServiceUrls) {
    try {
      const response = await fetch(serviceUrl)
      const result = await response.json()

      if (result.routes?.length) {
        data = result
        break
      }
    } catch {
      data = null
    }
  }

  const routeResults = data?.routes || []

  if (!routeResults.length) {
    throw new Error('OSRM did not return a drawable route.')
  }

  const straightDistanceKm = getDistanceInKm(startLat, startLng, endLat, endLng)
  const maxReasonableDistanceKm = Math.max(straightDistanceKm * 3.5, straightDistanceKm + 4)
  const reasonableRouteResults = routeResults.filter((routeResult) => {
    const distanceKm = routeResult.distance / 1000
    return distanceKm <= maxReasonableDistanceKm
  })

  if (!reasonableRouteResults.length) {
    throw new Error('Route service returned an unreasonable detour.')
  }

  const routesToFormat = reasonableRouteResults

  const cyclingSpeedKmh = 15
  const formattedRoutes = routesToFormat.map((routeResult) => {
    const distanceKm = Number((routeResult.distance / 1000).toFixed(1))
    const path = routeResult.geometry.coordinates.map(([lng, lat]) => [lat, lng])

    return {
      path,
      routeKey: JSON.stringify(path.map(([lat, lng]) => [lat.toFixed(5), lng.toFixed(5)])),
      distanceKm,
      durationMin: Math.max(1, Math.round((distanceKm / cyclingSpeedKmh) * 60)),
      osrmDurationMin: Math.max(1, Math.round(routeResult.duration / 60))
    }
  })

  const uniqueRoutes = []
  const routeKeys = new Set()

  formattedRoutes.forEach((routeItem) => {
    if (!routeKeys.has(routeItem.routeKey)) {
      routeKeys.add(routeItem.routeKey)
      uniqueRoutes.push(routeItem)
    }
  })

  const firstRoute = uniqueRoutes[0]
  const shortestRoute = [...uniqueRoutes].sort((a, b) => a.distanceKm - b.distanceKm)[0]
  const fastestRoute = [...uniqueRoutes].sort((a, b) => a.durationMin - b.durationMin)[0]
  const safestRoute = uniqueRoutes.length > 1
    ? uniqueRoutes.find((routeItem) => routeItem !== shortestRoute && routeItem !== fastestRoute) || firstRoute
    : firstRoute

  const nextRouteOptions = {
    safest: safestRoute?.path || [],
    fastest: uniqueRoutes.length > 1 ? fastestRoute.path : [],
    shortest: uniqueRoutes.length > 1 ? shortestRoute.path : []
  }

  const nextRouteStats = {
    safest: safestRoute
      ? {
          distanceKm: safestRoute.distanceKm.toFixed(1),
          durationMin: safestRoute.durationMin
        }
      : null,
    fastest: uniqueRoutes.length > 1
      ? {
          distanceKm: fastestRoute.distanceKm.toFixed(1),
          durationMin: fastestRoute.durationMin
        }
      : null,
    shortest: uniqueRoutes.length > 1
      ? {
          distanceKm: shortestRoute.distanceKm.toFixed(1),
          durationMin: shortestRoute.durationMin
        }
      : null
  }

  return {
    options: nextRouteOptions,
    stats: nextRouteStats
  }
}

function buildFallbackCityRoute() {
  const start = userCurrentCoords.value
  const end = selectedDestination.value.coords
  const stopPoints = selectedStops.value.map((stop) => stop.coords)
  const path = [start, ...stopPoints, end]
  const distanceKm = path
    .slice(1)
    .reduce((totalDistance, point, index) => {
      const previousPoint = path[index]
      return totalDistance + getDistanceInKm(previousPoint[0], previousPoint[1], point[0], point[1])
    }, 0)

  return {
    path,
    distanceKm: Number(distanceKm.toFixed(1)),
    durationMin: Math.max(1, Math.round((distanceKm / 15) * 60))
  }
}

async function loadOsrmRoadRoute() {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    resetRouteResults()
    return
  }

  try {
    const osrmRoutes = await fetchOsrmRouteOptions()

    roadRouteOptions.value = osrmRoutes.options
    routeStats.value = osrmRoutes.stats

    if (!osrmRoutes.options[activeMode.value]?.length) {
      activeMode.value = 'safest'
    }
  } catch (error) {
    const fallbackRoute = buildFallbackCityRoute()
    roadRouteOptions.value = {
      safest: fallbackRoute.path,
      fastest: [],
      shortest: []
    }
    routeStats.value = {
      safest: {
        distanceKm: fallbackRoute.distanceKm,
        durationMin: fallbackRoute.durationMin,
        routeTypeLabel: 'Safest Route',
        explanation: 'Using a simplified city route preview because the live routing service returned an unreliable route.'
      },
      fastest: null,
      shortest: null
    }
    activeMode.value = 'safest'
  }
}

async function refreshRoadRoute() {
  await loadRoadRoute()
  updateMapScene()
}

function focusDestination(coords) {
  if (!map) {
    return
  }

  map.flyTo(coords, 14, {
    duration: 0.7
  })
}

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getRouteSearchCenter() {
  const path = routePathToDraw.value.length ? routePathToDraw.value : [userCurrentCoords.value]
  const middlePoint = path[Math.floor(path.length / 2)] || userCurrentCoords.value

  return middlePoint
}

function getDistanceToCurrentRouteKm(lat, lng) {
  const path = routePathToDraw.value.length ? routePathToDraw.value : [userCurrentCoords.value]

  return Math.min(
    ...path.map(([routeLat, routeLng]) => getDistanceInKm(lat, lng, routeLat, routeLng))
  )
}

function isNearCurrentRoute(lat, lng, maxDistanceKm = 0.28) {
  return getDistanceToCurrentRouteKm(lat, lng) <= maxDistanceKm
}

function findNearestBikeParking(userCoords, geojson, limit = 5) {
  return geojson.features
    .filter((feature) => feature.geometry?.type === 'Point')
    .map((feature) => {
      const [lng, lat] = feature.geometry.coordinates

      return {
        ...feature,
        distanceKm: getDistanceInKm(userCoords[0], userCoords[1], lat, lng)
      }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}

function isDedicatedBikeLane(feature) {
  const properties = feature.properties || {}
  const geometryType = feature.geometry?.type

  if (!['LineString', 'MultiLineString', 'Polygon'].includes(geometryType)) {
    return false
  }

  return properties.highway === 'cycleway' ||
    properties.cycleway === 'track' ||
    properties.cycleway === 'lane' ||
    properties['cycleway:left'] === 'track' ||
    properties['cycleway:right'] === 'track' ||
    properties.bicycle === 'designated' ||
    properties.bicycle === 'yes'
}

function showDedicatedBikeLanes() {
  fetch('/bike_line.geojson')
    .then((res) => res.json())
    .then((data) => {
      const dedicatedBikeLanes = (data.features || []).filter(isDedicatedBikeLane)

      if (bikeLaneLayer) {
        map.removeLayer(bikeLaneLayer)
      }

      bikeLaneLayer = L.geoJSON(dedicatedBikeLanes, {
        style: {
          color: '#00c7be',
          weight: 4,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name || 'Dedicated bike lane'
          const laneType = feature.properties?.cycleway || feature.properties?.highway || 'cycle route'
          layer.bindTooltip(`${name} · ${laneType}`)
        }
      }).addTo(map)
    })
    .catch(() => {
      bikeLaneLayer = null
    })
}

function showNearestBikeParking(userCoords) {
  fetch('/bike_parking.geojson')
    .then((res) => res.json())
    .then((data) => {
      const nearestParking = (destinationQuery.value.trim() && selectedDestination.value?.coords
        ? data.features
            .filter((feature) => feature.geometry?.type === 'Point')
            .map((feature) => {
              const [lng, lat] = feature.geometry.coordinates

              return {
                ...feature,
                distanceKm: getDistanceToCurrentRouteKm(lat, lng)
              }
            })
            .filter((parking) => parking.distanceKm <= 0.28)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 7)
        : findNearestBikeParking(userCoords, data, 7))

      if (parkingLayer) {
        map.removeLayer(parkingLayer)
      }

      parkingLayer = L.layerGroup(
        nearestParking.map((parking) => {
          const [lng, lat] = parking.geometry.coordinates
          const name = parking.properties?.name || parking.properties?.asset_type || 'Bike Parking'
          const capacity = parking.properties?.capacity || parking.properties?.spaces || 'Unknown'
          const distanceM = Math.round(parking.distanceKm * 1000)

          const stop = {
            name,
            type: 'bikeParking',
            coords: [lat, lng]
          }
          const marker = L.marker([lat, lng], {
            icon: createHtmlMarker('P', 'is-parking')
          })

          bindAddStopPopup(marker, stop, distanceM, `🚲 Capacity: ${capacity}`)

          return marker
        })
      ).addTo(map)
    })
    .catch(() => {
      parkingLayer = null
    })
}

function focusCurrentLocation() {
  if (!map) {
    return
  }

  map.once('locationfound', (event) => {
    const userCoords = [event.latlng.lat, event.latlng.lng]

    if (!isWithinMelbourneCity(userCoords)) {
      isUsingRealLocation.value = false
      showLocationWarning('Your current location is outside the supported Melbourne city routing area.')
      updateMapScene()
      return
    }

    clearLocationWarning()
    originQuery.value = 'Current Location'
    userCurrentCoords.value = userCoords
    isUsingRealLocation.value = true

    map.flyTo(userCoords, 14, { duration: 0.7 })

    if (startMarker) {
      map.removeLayer(startMarker)
    }

    refreshRoadRoute()

    if (hasToggle('bikeParking')) {
      showNearestBikeParking(userCoords)
    }

    if (hasToggle('toilets')) {
      showNearbyFacilities('toilets', userCoords)
    }

    if (hasToggle('water')) {
      showNearbyFacilities('water', userCoords)
    }
  })

  map.once('locationerror', () => {
    isUsingRealLocation.value = false
    updateMapScene()
  })

  map.locate({
    setView: false,
    maxZoom: 14,
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 60000
  })
}

function useRealCurrentLocationOnLoad() {
  updateMapScene()
}

function createHtmlMarker(label, modifier = '') {
  const isPointMarker =
    modifier === 'is-parking' ||
    modifier === 'is-start' ||
    modifier === 'is-toilet' ||
    modifier === 'is-water'

  return L.divIcon({
    className: 'release-map-marker-wrapper',
    html: `<div class="release-map-marker ${modifier}">${label}</div>`,
    iconSize: isPointMarker ? [24, 24] : [96, 34],
    iconAnchor: isPointMarker ? [12, 12] : [48, 17]
  })
}

function resetLeafletLayers() {
  ;[routeLayer, arrowLayer, safeZonesLayer, riskLayer, popularLayer, parkingLayer, bikeLaneLayer, toiletLayer, waterLayer, startMarker, ...stopMarkers, destinationMarker]
    .filter(Boolean)
    .forEach((layer) => map.removeLayer(layer))
  stopMarkers = []
}

function getMelbourneCityBounds() {
  return L.latLngBounds(
    [MELBOURNE_CITY_BOUNDS.south, MELBOURNE_CITY_BOUNDS.west],
    [MELBOURNE_CITY_BOUNDS.north, MELBOURNE_CITY_BOUNDS.east]
  )
}

function buildCityBoundaryLayer() {
  if (cityBoundaryLayer) {
    map.removeLayer(cityBoundaryLayer)
  }

  cityBoundaryLayer = L.rectangle(getMelbourneCityBounds(), {
    color: '#007aff',
    weight: 2,
    opacity: 0.7,
    fillColor: '#007aff',
    fillOpacity: 0.04,
    dashArray: '8 8'
  }).addTo(map)
}

function buildRouteLayer() {
  if (!destinationQuery.value.trim()) {
    routeLayer = L.layerGroup([])
    return
  }

  const alternativeLayers = releaseRouteModes
    .filter((mode) => mode.id !== activeMode.value && roadRouteOptions.value[mode.id]?.length)
    .map((mode) =>
      L.layerGroup([
        L.polyline(roadRouteOptions.value[mode.id], {
          color: routeVisuals[mode.id]?.halo || '#ffffff',
          weight: 8,
          opacity: 0.72,
          lineCap: 'round',
          lineJoin: 'round'
        }),
        L.polyline(roadRouteOptions.value[mode.id], {
          color: getRouteColor(mode.id),
          weight: 5,
          opacity: 0.58,
          dashArray: '8 10',
          lineCap: 'round',
          lineJoin: 'round'
        })
      ])
    )

  routeLayer = L.layerGroup([
    ...alternativeLayers,
    L.polyline(routePathToDraw.value, {
      color: activeRouteVisual.value.halo,
      weight: 12,
      opacity: 0.88,
      lineCap: 'round',
      lineJoin: 'round'
    }),
    L.polyline(routePathToDraw.value, {
      color: activeRouteVisual.value.color,
      weight: 7,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    })
  ])

  if (hasToggle('safeRoutes')) {
    routeLayer.addTo(map)
  }
}

function buildSafeZonesLayer() {
  safeZonesLayer = L.layerGroup([])
}

function buildRiskLayer() {
  riskLayer = L.layerGroup(
    releaseRiskPoints.map((point) =>
      L.circleMarker(point.coords, {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#d76666',
        fillOpacity: 1
      }).bindPopup(point.label)
    )
  )

  if (hasToggle('riskAreas')) {
    riskLayer.addTo(map)
  }
}

function buildPopularLayer() {
  popularLayer = L.layerGroup(
    releasePopularRoutes.map((route) =>
      L.circleMarker(route.coords, {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: '#d76666',
        fillOpacity: 1
      }).bindTooltip(`${route.title}: ${route.subtitle}`)
    )
  )

  if (hasToggle('popularRoutes')) {
    popularLayer.addTo(map)
  }
}

function buildEndpoints() {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    startMarker = L.marker(userCurrentCoords.value, {
      icon: createHtmlMarker(isUsingRealLocation.value ? 'You' : 'Start', 'is-start')
    }).addTo(map)
    return
  }

  startMarker = L.marker(userCurrentCoords.value, {
    icon: createHtmlMarker(isUsingRealLocation.value ? 'You' : 'Start', 'is-start')
  }).addTo(map)

  stopMarkers = selectedStops.value.map((stop, index) =>
    L.marker(stop.coords, {
      icon: createHtmlMarker(`Stop ${index + 1}`, 'is-stop')
    }).addTo(map)
  )

  destinationMarker = L.marker(selectedDestination.value.coords, {
    icon: createHtmlMarker(selectedDestination.value.name, 'is-destination')
  }).addTo(map)
}

function updateMapScene() {
  if (!map) {
    return
  }

  resetLeafletLayers()
  buildRouteLayer()
  buildNavigationArrows()
  buildSafeZonesLayer()
  buildRiskLayer()
  buildPopularLayer()
  buildEndpoints()

  if (hasToggle('bikeParking')) {
    showNearestBikeParking(userCurrentCoords.value)
  }

  if (hasToggle('bikeLanes')) {
    showDedicatedBikeLanes()
  }

  if (hasToggle('toilets')) {
    showNearbyFacilities('toilets', userCurrentCoords.value)
  }

  if (hasToggle('water')) {
    showNearbyFacilities('water', userCurrentCoords.value)
  }

  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
    map.setView(userCurrentCoords.value, 14)
    return
  }

  const bounds = L.latLngBounds(routePathToDraw.value)
  bounds.extend(userCurrentCoords.value)
  bounds.extend(selectedDestination.value.coords)
  map.fitBounds(bounds, {
    padding: [80, 80],
    maxZoom: 13
  })
}

function initializeMap() {
  const maxBounds = getMelbourneCityBounds()

  map = L.map(mapContainer.value, {
    zoomControl: false,
    maxBounds,
    maxBoundsViscosity: 1,
    minZoom: 14,
    maxZoom: 18
  }).fitBounds(maxBounds, {
    padding: [18, 18],
    maxZoom: 14
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    bounds: maxBounds,
    noWrap: true
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)
  map.setMaxBounds(maxBounds)
  buildCityBoundaryLayer()
  updateMapScene()
}

onMounted(async () => {
  await nextTick()
  applyDestinationFromQuery()
  initializeMap()
  useRealCurrentLocationOnLoad()

  if (route?.query?.showRoute === 'true' && destinationQuery.value.trim()) {
    await searchDestination()
  } else {
    updateMapScene()
  }

  setTimeout(() => {
    map?.invalidateSize()
    updateMapScene()
  }, 150)
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})

watch(activeMode, updateMapScene)
watch(activeToggles, updateMapScene, { deep: true })
watch(selectedDestinationId, refreshRoadRoute)
</script>

<template>
<main class="release-map" data-test="dev-map-panel">
    <section class="map-stage" aria-label="SmartCycle route planner map">
      <div ref="mapContainer" class="map-canvas"></div>

      <aside class="search-panel">

        <label class="search-field">
          <span>A</span>
          <input
            v-model="originQuery"
            type="text"
            placeholder="Start point"
            @focus="showOriginSuggestions = true"
            @click="showOriginSuggestions = true"
            @keydown.enter.prevent="searchRoute"
          />
        </label>

        <label class="search-field">
          <span>🔍</span>
          <input
            v-model="destinationQuery"
            type="text"
            placeholder="Destination"
            @focus="showDestinationSuggestions = true"
            @click="showDestinationSuggestions = true"
            @keydown.enter.prevent="searchRoute"
          />
        </label>

        <button type="button" class="search-button" @click="searchRoute">
          Search Route
        </button>

        <p v-if="locationWarning" class="location-warning">
          {{ locationWarning }}
        </p>

        <div v-if="showOriginSuggestions && filteredOrigins.length" class="suggestion-list">
          <button
            v-for="location in filteredOrigins"
            :key="location.id"
            type="button"
            class="suggestion-option"
            :class="{ active: originQuery === location.name }"
            @click="chooseOrigin(location)"
          >
            <span class="suggestion-icon">⌖</span>
            <span>{{ location.name }}</span>
          </button>
        </div>

        <div v-if="showDestinationSuggestions && filteredDestinations.length" class="suggestion-list destination-list">
          <button
            v-for="location in filteredDestinations"
            :key="location.id"
            type="button"
            class="suggestion-option destination-option"
            :class="{ active: selectedDestinationId === location.id }"
            @click="chooseDestination(location)"
          >
            <span class="suggestion-icon">↻</span>
            <span>{{ location.name }}</span>
          </button>
        </div>

        <button type="button" class="layer-toggle-button" @click="showLayerControls = !showLayerControls">
          Map Layers {{ showLayerControls ? '▲' : '▼' }}
        </button>

        <div v-show="showLayerControls" class="toggle-list">
          <label v-for="toggle in mapToggles" :key="toggle.key">
            <input
              type="checkbox"
              :checked="hasToggle(toggle.key)"
              @change="toggleLayer(toggle.key)"
            />
            <span :style="{ background: toggle.color }"></span>
            {{ toggle.label }}
          </label>
        </div>
      </aside>





      <section v-if="destinationQuery.trim() && selectedDestination" class="bottom-route-card">
        <div class="navigation-summary">
          <div class="route-main-info">
            <p class="navigation-mode" :style="{ color: activeRouteVisual.color }">
              🚲 {{ releaseRouteModes.find((mode) => mode.id === activeMode)?.label || 'Selected' }} Route
            </p>
            <h2>
              {{ plannerSummary.time }}<template v-if="plannerSummary.distance"> · {{ plannerSummary.distance }}</template>
            </h2>
            <span>
              {{ usingModelRoutes ? 'Model safety score' : 'Fallback safety estimate' }} {{ plannerSummary.score }}/10 · {{ selectedDestination?.name }}
              <template v-if="selectedStops.length"> · {{ selectedStops.length }} stop{{ selectedStops.length === 1 ? '' : 's' }}</template>
            </span>
          </div>

          <div class="bottom-actions">
            <button
              v-if="navigationStarted"
              type="button"
              class="back-button"
              @click="stopNavigation"
            >
              Back
            </button>
            <button type="button" class="detail-toggle" @click="showRouteDetails = !showRouteDetails">
              {{ showRouteDetails ? 'Hide' : 'Details' }}
            </button>
            <button type="button" class="start-button" :class="{ started: navigationStarted }" @click="startNavigation">
              {{ navigationStarted ? 'Started' : 'Start' }}
            </button>
          </div>
        </div>

        <p v-if="navigationStarted" class="navigation-feedback">
          Navigation preview started. Follow the highlighted route on the map.
        </p>

        <div v-if="selectedStops.length" class="stop-list">
          <div class="stop-list-content">
            <strong>Stops:</strong>
            <div class="stop-items">
              <span v-for="stop in selectedStops" :key="getStopKey(stop)" class="stop-item">
                {{ stop.name }}
                <button type="button" aria-label="Remove stop" @click="removeRouteStop(stop)">×</button>
              </span>
            </div>
          </div>
          <button type="button" class="clear-stops-button" @click="clearRouteStops">Clear all</button>
        </div>

        <div v-show="showRouteDetails" class="bottom-detail-panel">
          <div class="mode-tabs compact-tabs">
            <button
              v-for="mode in availableRouteModes"
              :key="mode.id"
              type="button"
              :class="{ active: activeMode === mode.id }"
              :style="{ '--route-color': getRouteColor(mode.id) }"
              @click="activeMode = mode.id"
            >
              <span class="route-tab-dot" :style="{ background: getRouteColor(mode.id) }"></span>
              {{ mode.label }}
            </button>
          </div>

          <div class="route-legend" aria-label="Route colour legend">
            <span v-for="mode in availableRouteModes" :key="`legend-${mode.id}`">
              <i :style="{ background: getRouteColor(mode.id) }"></i>
              {{ mode.label }}
            </span>
          </div>

          <p class="route-count-note">
            {{ availableRouteCount }} available route option{{ availableRouteCount === 1 ? '' : 's' }}
            <span v-if="availableRouteCount === 1"> · only one route returned by map service</span>
            <span v-if="!usingModelRoutes"> · model route API disabled or unavailable</span>
          </p>
          <div class="bottom-detail-grid">
            <div class="mini-score">
              <div class="shield">S</div>
              <div>
                <strong>{{ plannerSummary.score }}</strong><span> /10</span>
                <p>Safety Score</p>
              </div>
            </div>
            <div>
              <p><strong>Route Type:</strong> {{ plannerSummary.routeType }}</p>
              <p class="summary-text">{{ plannerSummary.subtitle }}</p>
            </div>
          </div>

          <div class="safety-visual-card">
            <div class="safety-meter-header">
              <span>{{ routeSafetyProfile.riskLevel }}</span>
              <strong>{{ routeSafetyProfile.normalizedScore }}%</strong>
            </div>
            <div class="safety-meter">
              <span
                :style="{
                  width: `${routeSafetyProfile.normalizedScore}%`,
                  background: activeRouteVisual.color
                }"
              ></span>
            </div>
            <p>{{ routeSafetyProfile.description }}</p>
          </div>

          <div class="route-feature-chips">
            <span
              v-for="feature in routeSafetyProfile.features"
              :key="feature"
              :style="{ borderColor: activeRouteVisual.color }"
            >
              {{ feature }}
            </span>
          </div>

          <div class="analysis-note">
            <strong>Safety analysis</strong>
            <p>{{ routeSafetyProfile.modelNote }}</p>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.release-map {
  min-height: calc(100vh - 79px);
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(232, 238, 247, 0.98)),
    #f5f5f7;
}


.map-stage {
  position: relative;
  min-height: calc(100vh - 116px);
  max-width: 1180px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 30px;
  background:
    linear-gradient(rgba(245, 247, 250, 0.18), rgba(245, 247, 250, 0.2)),
    #eef2f7;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.14);
}

:deep(.leaflet-container) {
  font: inherit;
}

:deep(.release-map-marker-wrapper) {
  background: transparent;
  border: 0;
}

:deep(.release-map-marker) {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.13);
  color: #1d1d1f;
  font-size: 0.85rem;
  font-weight: 800;
  text-align: center;
}

:deep(.release-map-marker.is-start) {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 3px solid #ffffff;
  border-radius: 50%;
  background: #0071e3;
  color: transparent;
  font-size: 0;
  box-shadow: 0 0 0 4px rgba(91, 148, 239, 0.24);
}

:deep(.release-map-marker.is-stop) {
  background: #ff9f0a;
  color: #ffffff;
}

:deep(.release-map-marker.is-popular) {
  background: #e9f6ee;
  color: #2f855f;
}

:deep(.release-map-marker.is-parking) {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #1f4e79;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 900;
  box-shadow: 0 3px 8px rgba(31, 68, 128, 0.25);
}

:deep(.release-map-marker.is-toilet),
:deep(.release-map-marker.is-water) {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 2px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 900;
  box-shadow: 0 3px 8px rgba(31, 68, 128, 0.25);
}

:deep(.release-map-marker.is-toilet) {
  background: #8b5cf6;
}

:deep(.release-map-marker.is-water) {
  background: #0ea5e9;
}

:deep(.release-map-marker.is-destination) {
  background: rgba(255, 255, 255, 0.96);
}

.map-canvas {
  position: absolute;
  inset: 0;
}

.search-panel,
.bottom-route-card {
  position: absolute;
  z-index: 400;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.13);
  backdrop-filter: blur(22px);
}

.search-panel {
  top: 24px;
  left: 24px;
  width: 320px;
  padding: 10px;
}

.location-button {
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 17px;
  background: #0071e3;
  color: #ffffff;
  text-align: center;
  cursor: pointer;
  font-weight: 800;
}

.location-button:hover {
  background: #0066cc;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin-top: 8px;
  padding: 0 12px;
  border-radius: 17px;
  background: rgba(245, 245, 247, 0.9);
  color: #6e6e73;
}

.search-field span {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 900;
}

.search-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #1d1d1f;
  font-size: 1rem;
}

.search-field input:focus {
  outline: none;
}

.search-button {
  width: 100%;
  min-height: 42px;
  margin-top: 8px;
  border: 0;
  border-radius: 17px;
  background: #34c759;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
}

.search-button:hover {
  background: #2fb350;
}

.location-warning {
  margin: 8px 4px 0;
  padding: 9px 10px;
  border-radius: 15px;
  background: rgba(255, 159, 10, 0.13);
  color: #9a5b00;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.35;
}

.layer-toggle-button {
  display: block;
  width: 100%;
  min-height: 40px;
  margin-top: 8px;
  border: 0;
  border-radius: 17px;
  background: rgba(0, 113, 227, 0.1);
  color: #0066cc;
  cursor: pointer;
  font-weight: 800;
}

.suggestion-list,
.destination-list {
  display: grid;
  gap: 2px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1px rgba(60, 60, 67, 0.08);
}

.suggestion-option,
.destination-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #424245;
  text-align: left;
  cursor: pointer;
  font-size: 0.92rem;
}

.suggestion-option:hover,
.destination-option:hover {
  background: rgba(0, 113, 227, 0.08);
}

.suggestion-option.active,
.destination-option.active {
  background: #0071e3;
  color: #ffffff;
  font-weight: 800;
}

.suggestion-icon {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(60, 60, 67, 0.1);
  color: #6e6e73;
  font-size: 0.78rem;
  font-weight: 900;
}

.suggestion-option.active .suggestion-icon,
.destination-option.active .suggestion-icon {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.toggle-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.toggle-list label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #424245;
}

.toggle-list input {
  width: auto;
}

.toggle-list span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}


.mode-tabs {
  display: flex;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(245, 245, 247, 0.95);
}

.mode-tabs button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  min-height: 34px;
  border: 0;
  background: transparent;
  color: #6e6e73;
  cursor: pointer;
}

.mode-tabs button.active {
  background: var(--route-color, #1d1d1f);
  color: #ffffff;
  font-weight: 800;
}

.route-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.72);
}

.route-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.route-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(245, 245, 247, 0.9);
  color: #424245;
  font-size: 0.8rem;
  font-weight: 800;
}

.route-legend i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.route-count-note {
  margin: 10px 0 0;
  color: #6e6e73;
  font-size: 0.85rem;
}

.score-summary {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 18px;
}

.shield {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 15px;
  background: #34c759;
  color: #ffffff;
  font-size: 1.6rem;
  font-weight: 900;
}

.score-summary h2,
.popular-card h2,
.bottom-content h2 {
  margin: 0;
  color: #304765;
  font-size: 1.05rem;
}

.score-summary p,
.bottom-content p {
  margin: 4px 0;
}

.score-summary strong,
.bottom-content strong {
  color: #2f855f;
  font-size: 1.45rem;
}

.summary-text {
  color: #6e6e73;
}


.time {
  color: #2f855f;
  font-weight: 800;
}

.distance {
  margin-top: -6px;
  color: #526780;
  font-size: 0.9rem;
}


.safe {
  background: #3d9b72;
}

.medium {
  background: #d6a42c;
}

.risk {
  background: #d76666;
}

.parking {
  background: #1f4e79;
}


.badge {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #edf4ff;
}

.bottom-route-card {
  right: 24px;
  bottom: 24px;
  width: 520px;
  max-width: calc(100% - 48px);
  padding: 18px;
}

.navigation-summary {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  color: #6e6e73;
}

.route-main-info {
  min-width: 0;
}

.navigation-summary h2 {
  margin: 4px 0;
  color: #1d1d1f;
  font-size: 1.7rem;
  line-height: 1.1;
}

.navigation-summary span {
  font-size: 0.9rem;
}

.navigation-mode {
  margin: 0;
  color: #34c759;
  font-weight: 800;
}

.bottom-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
  align-items: center;
}

.stop-list {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 159, 10, 0.12);
  color: #424245;
  font-size: 0.84rem;
}

.stop-list-content {
  display: grid;
  gap: 8px;
}

.stop-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stop-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  color: #1d1d1f;
  font-weight: 800;
}

.stop-item button,
.clear-stops-button,
:deep(.add-stop-popup-button) {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 800;
}

.stop-item button {
  width: 22px;
  height: 22px;
  padding: 0;
  background: #ff9f0a;
  color: #ffffff;
}

.clear-stops-button {
  padding: 8px 12px;
  background: #ff9f0a;
  color: #ffffff;
}

:deep(.add-stop-popup-button) {
  margin-top: 8px;
  padding: 7px 12px;
  background: #0071e3;
  color: #ffffff;
}

.navigation-summary button {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
}

.back-button,
.detail-toggle {
  padding: 0 16px;
  background: rgba(0, 113, 227, 0.1);
  color: #0066cc;
}

.back-button {
  background: rgba(60, 60, 67, 0.1);
  color: #424245;
}
.navigation-feedback {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(52, 199, 89, 0.12);
  color: #2f855f;
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1.35;
}

:deep(.navigation-arrow-wrapper) {
  background: transparent;
  border: 0;
}

:deep(.navigation-arrow) {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  color: #34c759;
  font-size: 0.82rem;
  font-weight: 900;
  text-shadow:
    0 1px 0 #ffffff,
    1px 0 0 #ffffff,
    0 -1px 0 #ffffff,
    -1px 0 0 #ffffff,
    0 2px 4px rgba(15, 23, 42, 0.2);
}

.start-button {
  padding: 0 22px;
  background: #0071e3;
  color: #ffffff;
}

.start-button.started {
  background: #34c759;
}

.navigation-feedback {
  margin: 10px 0 0;
  padding: 9px 12px;
  border-radius: 14px;
  background: rgba(52, 199, 89, 0.12);
  color: #2f855f;
  font-size: 0.84rem;
  font-weight: 800;
}

.bottom-detail-panel {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(60, 60, 67, 0.14);
}

.compact-tabs {
  max-width: 360px;
}

.bottom-detail-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 14px;
  margin-top: 12px;
  color: #424245;
}

.mini-score {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mini-score strong {
  color: #34c759;
  font-size: 1.35rem;
}

.mini-score p {
  margin: 2px 0 0;
  color: #6e6e73;
}

.safety-visual-card {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(245, 245, 247, 0.86);
}

.safety-meter-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #1d1d1f;
  font-weight: 900;
}

.safety-meter {
  height: 10px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.12);
}

.safety-meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.safety-visual-card p {
  margin: 12px 0 0;
  color: #424245;
  font-size: 0.9rem;
  line-height: 1.45;
}

.route-feature-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.route-feature-chips span {
  min-height: 30px;
  padding: 6px 10px;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #1d1d1f;
  font-size: 0.82rem;
  font-weight: 800;
}

.analysis-note {
  margin-top: 12px;
  padding: 13px 14px;
  border-radius: 18px;
  background: rgba(0, 113, 227, 0.1);
  color: #1d1d1f;
}

.analysis-note p {
  margin: 6px 0 0;
  color: #424245;
  font-size: 0.88rem;
  line-height: 1.45;
}

@media (max-width: 980px) {
  .release-map {
    padding: 12px;
  }

  .map-stage {
    min-height: calc(100vh - 104px);
  }

  .search-panel,
  .bottom-route-card {
    left: 16px;
    right: 16px;
    width: auto;
  }

  .bottom-route-card {
    bottom: 16px;
  }
}

@media (max-width: 640px) {
  .release-map {
    min-height: calc(100vh - 150px);
    padding: 0;
  }

  .map-stage {
    min-height: calc(100vh - 96px);
    height: calc(100vh - 96px);
    border-radius: 0;
  }

  .search-panel {
    top: 12px;
    left: 12px;
    right: 12px;
    width: auto;
    padding: 8px;
    border-radius: 22px;
  }

  .location-button {
    min-height: 38px;
  }


  .toggle-list {
    grid-template-columns: 1fr;
    max-height: 160px;
    overflow-y: auto;
  }


  .bottom-route-card {
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    padding: 14px;
    border-radius: 24px;
  }

  .navigation-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .bottom-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
  }

  .stop-list {
    align-items: flex-start;
    flex-direction: column;
  }

  .navigation-summary h2 {
    font-size: 1.25rem;
  }

  .navigation-summary span {
    font-size: 0.8rem;
  }

  .bottom-detail-grid {
    grid-template-columns: 1fr;
  }

  .compact-tabs {
    max-width: none;
  }

  .detail-toggle,
  .start-button {
    width: 100%;
  }
}
</style>
