<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
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
} from '../data/releaseMapData'

const route = useRoute()
const activeMode = ref('safest')
const destinationQuery = ref('')
const selectedDestinationId = ref('new-park')
const customDestination = ref(null)
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
const activeToggles = ref([])
const mapToggles = computed(() => [
  { key: 'safeRoutes', label: 'Show Route', color: '#45a875' },
  { key: 'bikeParking', label: 'Show Nearby Bike Parking', color: '#1f4e79' },
  { key: 'toilets', label: 'Show Nearby Toilets', color: '#8b5cf6' },
  { key: 'water', label: 'Show Nearby Water', color: '#0ea5e9' }
])

const mapContainer = ref(null)
let map
let routeLayer
let safeZonesLayer
let riskLayer
let popularLayer
let parkingLayer
let toiletLayer
let waterLayer
let startMarker
let destinationMarker

const currentLocation = plannerLocations.find((location) => location.id === 'current')
const userCurrentCoords = ref(currentLocation.coords)
const isUsingRealLocation = ref(false)

const destinationOptions = computed(() =>
  plannerLocations.filter((location) => location.id !== 'current')
)

const filteredDestinations = computed(() => {
  const query = destinationQuery.value.trim().toLowerCase()

  if (!query) {
    return []
  }

  return destinationOptions.value.filter((location) =>
    location.name.toLowerCase().includes(query)
  )
})

const selectedDestination = computed(() => {
  return customDestination.value || destinationOptions.value.find((location) => location.id === selectedDestinationId.value)
})

const activeProfile = computed(() => releaseRouteProfiles[activeMode.value])

const activeAlerts = computed(() => releaseRiskAlerts[activeMode.value] || [])

const plannerSummary = computed(() => {
  const stats = routeStats.value[activeMode.value]

  return {
    score: activeProfile.value.score,
    time: stats ? `${stats.durationMin} mins` : activeProfile.value.time,
    distance: stats ? `${stats.distanceKm} km` : '',
    routeType: activeProfile.value.routeType,
    subtitle: activeProfile.value.subtitle
  }
})

const displayRoutePath = computed(() => [
  userCurrentCoords.value,
  selectedDestination.value.coords
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

function showNearbyFacilities(type, userCoords) {
  const [lat, lng] = userCoords
  const queryTag = type === 'toilets'
    ? 'node["amenity"="toilets"]'
    : 'node["amenity"="drinking_water"]'

  const query = `
    [out:json][timeout:12];
    (
      ${queryTag}(around:1500,${lat},${lng});
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
        .slice(0, 12)

      if (type === 'toilets' && toiletLayer) {
        map.removeLayer(toiletLayer)
      }

      if (type === 'water' && waterLayer) {
        map.removeLayer(waterLayer)
      }

      const layer = L.layerGroup(
        facilities.map((item) => {
          const name = item.tags?.name || (type === 'toilets' ? 'Public Toilet' : 'Drinking Water')
          const distanceM = Math.round(getDistanceInKm(lat, lng, item.lat, item.lon) * 1000)

          return L.marker([item.lat, item.lon], {
            icon: createFacilityMarker(type)
          }).bindPopup(
            `<strong>${name}</strong><br/>📍 Distance: ${distanceM}m`
          )
        })
      ).addTo(map)

      if (type === 'toilets') {
        toiletLayer = layer
      } else {
        waterLayer = layer
      }
    })
    .catch(() => {
      alert(`Unable to load nearby ${type === 'toilets' ? 'toilets' : 'water points'}`)
    })
}

function chooseDestination(location) {
  customDestination.value = null
  destinationQuery.value = location.name
  selectedDestinationId.value = location.id
  activeToggles.value = ['safeRoutes']
  refreshRoadRoute()
}

async function searchDestination() {
  const rawQuery = destinationQuery.value.trim()
  const query = rawQuery.toLowerCase()

  if (!query) {
    return
  }

  const matchedDestination = destinationOptions.value.find((location) =>
    location.name.toLowerCase() === query
  ) || destinationOptions.value.find((location) =>
    location.name.toLowerCase().includes(query)
  )

  if (matchedDestination) {
    chooseDestination(matchedDestination)
    return
  }

  try {
    const searchText = `${rawQuery}, Melbourne, Australia`
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchText)}`
    )
    const results = await response.json()
    const firstResult = results[0]

    if (!firstResult) {
      alert('Cannot find this destination on the map')
      return
    }

    customDestination.value = {
      id: 'custom-destination',
      name: firstResult.display_name?.split(',')[0] || rawQuery,
      coords: [Number(firstResult.lat), Number(firstResult.lon)]
    }
    selectedDestinationId.value = 'custom-destination'
    destinationQuery.value = rawQuery
    activeToggles.value = ['safeRoutes']
    await refreshRoadRoute()
  } catch (error) {
    alert('Unable to search this destination right now')
  }
}

function applyDestinationFromQuery() {
  const queryDestination = typeof route.query.destination === 'string'
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
    activeToggles.value = ['safeRoutes']
    return
  }

  destinationQuery.value = queryDestination
  activeToggles.value = ['safeRoutes']
}

async function loadRoadRoute() {
  if (!destinationQuery.value.trim() || !selectedDestination.value?.coords) {
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
    return
  }

  const [startLat, startLng] = userCurrentCoords.value
  const [endLat, endLng] = selectedDestination.value.coords

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&alternatives=3`
    )
    const data = await response.json()
    const routeResults = data.routes || []

    if (!routeResults.length) {
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
      return
    }

    const cyclingSpeedKmh = 15
    const formattedRoutes = routeResults.map((routeResult) => {
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

    roadRouteOptions.value = nextRouteOptions
    routeStats.value = nextRouteStats

    if (!nextRouteOptions[activeMode.value]?.length) {
      activeMode.value = 'safest'
    }
  } catch (error) {
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

function showNearestBikeParking(userCoords) {
  fetch('/bike_parking.geojson')
    .then((res) => res.json())
    .then((data) => {
      const nearestParking = findNearestBikeParking(userCoords, data, 12)

      if (parkingLayer) {
        map.removeLayer(parkingLayer)
      }

      parkingLayer = L.layerGroup(
        nearestParking.map((parking) => {
          const [lng, lat] = parking.geometry.coordinates
          const name = parking.properties?.name || parking.properties?.asset_type || 'Bike Parking'
          const capacity = parking.properties?.capacity || parking.properties?.spaces || 'Unknown'
          const distanceM = Math.round(parking.distanceKm * 1000)

          return L.marker([lat, lng], {
            icon: createHtmlMarker('P', 'is-parking')
          }).bindPopup(
            `<strong>${name}</strong><br/>🚲 Capacity: ${capacity}<br/>📍 Distance: ${distanceM}m`
          )
        })
      ).addTo(map)
    })
    .catch(() => {
      alert('Unable to load bike parking data')
    })
}

function focusCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userCoords = [position.coords.latitude, position.coords.longitude]
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
    },
    () => {
      alert('Unable to retrieve your location')
    }
  )
}

function useRealCurrentLocationOnLoad() {
  if (!navigator.geolocation) {
    updateMapScene()
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userCoords = [position.coords.latitude, position.coords.longitude]
      userCurrentCoords.value = userCoords
      isUsingRealLocation.value = true
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
    },
    () => {
      updateMapScene()
    }
  )
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
  ;[routeLayer, safeZonesLayer, riskLayer, popularLayer, parkingLayer, toiletLayer, waterLayer, startMarker, destinationMarker]
    .filter(Boolean)
    .forEach((layer) => map.removeLayer(layer))
}

function buildRouteLayer() {
  if (!destinationQuery.value.trim()) {
    routeLayer = L.layerGroup([])
    return
  }

  const alternativeLayers = releaseRouteModes
    .filter((mode) => mode.id !== activeMode.value && roadRouteOptions.value[mode.id]?.length)
    .map((mode) =>
      L.polyline(roadRouteOptions.value[mode.id], {
        color: '#8aa4bd',
        weight: 4,
        opacity: 0.35,
        lineCap: 'round'
      })
    )

  routeLayer = L.layerGroup([
    ...alternativeLayers,
    L.polyline(routePathToDraw.value, {
      color: '#00bcd4',
      weight: 8,
      opacity: 0.95,
      lineCap: 'round'
    })
  ])

  if (hasToggle('safeRoutes')) {
    routeLayer.addTo(map)
  }
}

function buildSafeZonesLayer() {
  safeZonesLayer = L.layerGroup(
    releaseSafeZones.map((zone) =>
      L.circle(zone.coords, {
        radius: zone.radius,
        color: '#45a875',
        weight: 1.5,
        fillColor: '#45a875',
        fillOpacity: 0.16
      }).bindTooltip(zone.label)
    )
  )

  if (hasToggle('safeRoutes')) {
    safeZonesLayer.addTo(map)
  }
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
  if (!destinationQuery.value.trim()) {
    startMarker = L.marker(userCurrentCoords.value, {
      icon: createHtmlMarker(isUsingRealLocation.value ? 'You' : 'Start', 'is-start')
    }).addTo(map)
    return
  }

  startMarker = L.marker(userCurrentCoords.value, {
    icon: createHtmlMarker(isUsingRealLocation.value ? 'You' : 'Start', 'is-start')
  }).addTo(map)

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
  buildSafeZonesLayer()
  buildRiskLayer()
  buildPopularLayer()
  buildEndpoints()

  if (hasToggle('bikeParking')) {
    showNearestBikeParking(userCurrentCoords.value)
  }

  if (hasToggle('toilets')) {
    showNearbyFacilities('toilets', userCurrentCoords.value)
  }

  if (hasToggle('water')) {
    showNearbyFacilities('water', userCurrentCoords.value)
  }

  if (!destinationQuery.value.trim()) {
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
  map = L.map(mapContainer.value, {
    zoomControl: false
  }).setView(userCurrentCoords.value, 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)
  updateMapScene()
}

onMounted(async () => {
  await nextTick()
  applyDestinationFromQuery()
  initializeMap()
  useRealCurrentLocationOnLoad()

  if (route.query.showRoute === 'true' && destinationQuery.value.trim()) {
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
  <main class="release-map">
    <section class="map-stage" aria-label="SmartCycle route planner map">
      <div ref="mapContainer" class="map-canvas"></div>

      <aside class="search-panel">
        <button type="button" class="location-button" @click="focusCurrentLocation">
          📍 Use My Current Location
        </button>

        <label class="search-field">
          <span>🔍</span>
          <input
            v-model="destinationQuery"
            type="text"
            placeholder="Search location..."
            @keydown.enter.prevent="searchDestination"
          />
        </label>

        <button type="button" class="search-button" @click="searchDestination">
          Search Route
        </button>

        <div v-if="destinationQuery.trim() && filteredDestinations.length" class="destination-list">
          <button
            v-for="location in filteredDestinations"
            :key="location.id"
            type="button"
            class="destination-option"
            :class="{ active: selectedDestinationId === location.id }"
            @click="chooseDestination(location)"
          >
            {{ location.name }}
          </button>
        </div>

        <div class="toggle-list">
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

      <aside v-if="destinationQuery.trim()" class="detail-card">
        <div class="mode-tabs">
          <button
            v-for="mode in availableRouteModes"
            :key="mode.id"
            type="button"
            :class="{ active: activeMode === mode.id }"
            @click="activeMode = mode.id"
          >
            {{ mode.label }}
          </button>
        </div>

        <p v-if="destinationQuery.trim()" class="route-count-note">
          {{ availableRouteCount }} available route option{{ availableRouteCount === 1 ? '' : 's' }}
          <span v-if="availableRouteCount === 1"> · only one route returned by map service</span>
        </p>

        <div class="score-summary">
          <div class="shield">S</div>
          <div>
            <h2>Safety Score</h2>
            <p><strong>{{ plannerSummary.score }}</strong> /10</p>
          </div>
        </div>

        <p><strong>Route Type:</strong> {{ plannerSummary.routeType }}</p>
        <p class="summary-text">{{ plannerSummary.subtitle }}</p>
        <p><strong>Estimated Time:</strong></p>
        <p class="time">{{ plannerSummary.time }}</p>
        <p v-if="plannerSummary.distance" class="distance">{{ plannerSummary.distance }}</p>
      </aside>




      <section v-if="destinationQuery.trim()" class="bottom-route-card">
        <div class="navigation-summary">
          <div>
            <p class="navigation-mode">🚲 {{ releaseRouteModes.find((mode) => mode.id === activeMode)?.label || 'Selected' }} Route</p>
            <h2>{{ plannerSummary.time }}<template v-if="plannerSummary.distance"> · {{ plannerSummary.distance }}</template></h2>
            <span>Safety score {{ plannerSummary.score }}/10 · {{ selectedDestination?.name }}</span>
          </div>
          <button type="button" @click="focusDestination(selectedDestination.coords)">
            Start
          </button>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.release-map {
  min-height: calc(100vh - 79px);
  padding: 16px;
  background: #78a9f4;
}

.map-stage {
  position: relative;
  min-height: 760px;
  max-width: 1180px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background:
    linear-gradient(rgba(229, 244, 255, 0.16), rgba(229, 244, 255, 0.22)),
    #dbeafe;
  box-shadow: 0 22px 58px rgba(31, 68, 128, 0.24);
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
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 18px rgba(31, 68, 128, 0.16);
  color: #476079;
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
  background: #5b94ef;
  color: transparent;
  font-size: 0;
  box-shadow: 0 0 0 4px rgba(91, 148, 239, 0.24);
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
.detail-card,
.bottom-route-card {
  position: absolute;
  z-index: 400;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 30px rgba(31, 68, 128, 0.15);
}

.search-panel {
  top: 24px;
  left: 24px;
  width: 290px;
  padding: 12px;
}

.location-button {
  width: 100%;
  min-height: 42px;
  border: 0;
  border-radius: 6px;
  background: #5b94ef;
  color: #ffffff;
  text-align: center;
  cursor: pointer;
  font-weight: 800;
}

.location-button:hover {
  background: #457fd8;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  margin-top: 8px;
  padding: 0 10px;
  border-radius: 5px;
  background: #f7faff;
  color: #66809e;
}

.search-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
}

.search-field input:focus {
  outline: none;
}

.search-button {
  width: 100%;
  min-height: 34px;
  margin-top: 8px;
  border: 0;
  border-radius: 5px;
  background: #3d9b72;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
}

.search-button:hover {
  background: #2f855f;
}

.destination-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.destination-option {
  min-height: 34px;
  border: 0;
  border-radius: 5px;
  background: #eef4ff;
  color: #476079;
  text-align: left;
  cursor: pointer;
}

.destination-option.active {
  background: #5b94ef;
  color: #ffffff;
  font-weight: 800;
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
  color: #476079;
}

.toggle-list input {
  width: auto;
}

.toggle-list span {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.detail-card {
  top: 146px;
  right: 24px;
  width: 320px;
  padding: 14px;
  color: #445a75;
  max-height: calc(100% - 220px);
  overflow-y: auto;
}

.mode-tabs {
  display: flex;
  overflow: hidden;
  border-radius: 6px;
  background: #edf3fb;
}

.mode-tabs button {
  flex: 1;
  min-height: 34px;
  border: 0;
  background: transparent;
  color: #506985;
  cursor: pointer;
}

.mode-tabs button.active {
  background: #5b94ef;
  color: #ffffff;
  font-weight: 800;
}

.route-count-note {
  margin: 10px 0 0;
  color: #60738a;
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
  border-radius: 8px;
  background: #3d9b72;
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
  color: #60738a;
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
  width: 430px;
  padding: 14px;
}

.navigation-summary {
  display: grid;
  grid-template-columns: 1fr 96px;
  gap: 14px;
  align-items: center;
  color: #526780;
}

.navigation-summary h2 {
  margin: 4px 0;
  color: #304765;
  font-size: 1.4rem;
}

.navigation-summary span {
  font-size: 0.9rem;
}

.navigation-mode {
  margin: 0;
  color: #2f855f;
  font-weight: 800;
}

.navigation-summary button {
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  background: #00bcd4;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
}

@media (max-width: 980px) {
  .release-map {
    padding: 12px;
  }

  .map-stage {
    min-height: 1180px;
  }

  .search-panel,
  .detail-card,
  .bottom-route-card {
    left: 16px;
    right: 16px;
    width: auto;
  }

  .detail-card {
    top: 228px;
  }


  .bottom-route-card {
    bottom: 16px;
  }
}

@media (max-width: 640px) {
  .release-map {
    min-height: calc(100vh - 150px);
    padding: 10px;
  }

  .map-stage {
    min-height: calc(100vh - 180px);
    border-radius: 10px;
  }

  .search-panel {
    top: 14px;
    left: 14px;
    right: 14px;
    width: auto;
    padding: 10px;
  }

  .location-button {
    min-height: 38px;
  }

  .toggle-list {
    grid-template-columns: 1fr;
  }

  .detail-card {
    display: none;
  }

  .bottom-route-card {
    left: 14px;
    right: 14px;
    bottom: 14px;
    width: auto;
    padding: 12px;
    border-radius: 16px;
  }

  .navigation-summary {
    grid-template-columns: 1fr 88px;
  }

  .navigation-summary h2 {
    font-size: 1.25rem;
  }
}
</style>
