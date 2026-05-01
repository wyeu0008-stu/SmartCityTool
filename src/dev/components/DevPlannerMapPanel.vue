<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  devMapToggles,
  devPlannerLocations,
  devPopularRoutes,
  devRiskAlerts,
  devRiskPoints,
  devRouteModes,
  devRouteProfiles,
  devSafeZones
} from '../services/devPlannerContentService'

const activeMode = ref('safest')
const destinationQuery = ref('New Park')
const selectedDestinationId = ref('new-park')
const activeToggles = ref(['safeRoutes', 'riskAreas', 'popularRoutes'])

const mapContainer = ref(null)
let map
let routeLayer
let safeZonesLayer
let riskLayer
let popularLayer
let startMarker
let destinationMarker

const currentLocation = devPlannerLocations.find((location) => location.id === 'current')
const destinationOptions = computed(() => devPlannerLocations.filter((location) => location.id !== 'current'))
const filteredDestinations = computed(() => {
  const query = destinationQuery.value.trim().toLowerCase()
  if (!query) return destinationOptions.value
  return destinationOptions.value.filter((location) => location.name.toLowerCase().includes(query))
})
const selectedDestination = computed(() => destinationOptions.value.find((location) => location.id === selectedDestinationId.value))
const activeProfile = computed(() => devRouteProfiles[activeMode.value])
const activeAlerts = computed(() => devRiskAlerts[activeMode.value] || [])

function hasToggle(toggleKey) {
  return activeToggles.value.includes(toggleKey)
}

function toggleLayer(toggleKey) {
  if (hasToggle(toggleKey)) {
    activeToggles.value = activeToggles.value.filter((key) => key !== toggleKey)
    return
  }
  activeToggles.value = [...activeToggles.value, toggleKey]
}

function chooseDestination(location) {
  destinationQuery.value = location.name
  selectedDestinationId.value = location.id
  focusDestination(location.coords)
}

function focusDestination(coords) {
  if (!map) return
  map.flyTo(coords, 14, { duration: 0.7 })
}

function focusCurrentLocation() {
  focusDestination(currentLocation.coords)
}

function createHtmlMarker(label, modifier = '') {
  return L.divIcon({
    className: 'dev-map-marker-wrapper',
    html: `<div class="dev-map-marker ${modifier}">${label}</div>`,
    iconSize: [110, 34],
    iconAnchor: [55, 17]
  })
}

function resetLeafletLayers() {
  ;[routeLayer, safeZonesLayer, riskLayer, popularLayer, startMarker, destinationMarker]
    .filter(Boolean)
    .forEach((layer) => map.removeLayer(layer))
}

function buildRouteLayer() {
  routeLayer = L.polyline(activeProfile.value.path, {
    color: activeProfile.value.color,
    weight: 7,
    opacity: 0.92,
    lineCap: 'round'
  })
  if (hasToggle('safeRoutes')) routeLayer.addTo(map)
}

function buildSafeZonesLayer() {
  safeZonesLayer = L.layerGroup(
    devSafeZones.map((zone) =>
      L.circle(zone.coords, {
        radius: zone.radius,
        color: '#45a875',
        weight: 1.5,
        fillColor: '#45a875',
        fillOpacity: 0.16
      }).bindTooltip(zone.label)
    )
  )
  if (hasToggle('safeRoutes')) safeZonesLayer.addTo(map)
}

function buildRiskLayer() {
  riskLayer = L.layerGroup(
    devRiskPoints.map((point) =>
      L.circleMarker(point.coords, {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#d76666',
        fillOpacity: 1
      }).bindPopup(point.label)
    )
  )
  if (hasToggle('riskAreas')) riskLayer.addTo(map)
}

function buildPopularLayer() {
  popularLayer = L.layerGroup(
    devPopularRoutes.map((route) =>
      L.marker(route.coords, {
        icon: createHtmlMarker(route.title, 'is-popular')
      }).bindTooltip(route.subtitle)
    )
  )
  if (hasToggle('popularRoutes')) popularLayer.addTo(map)
}

function buildEndpoints() {
  startMarker = L.marker(currentLocation.coords, {
    icon: createHtmlMarker('Start', 'is-start')
  }).addTo(map)

  destinationMarker = L.marker(selectedDestination.value.coords, {
    icon: createHtmlMarker(selectedDestination.value.name, 'is-destination')
  }).addTo(map)
}

function updateMapScene() {
  if (!map) return
  resetLeafletLayers()
  buildRouteLayer()
  buildSafeZonesLayer()
  buildRiskLayer()
  buildPopularLayer()
  buildEndpoints()
  const bounds = L.latLngBounds(activeProfile.value.path)
  bounds.extend(currentLocation.coords)
  bounds.extend(selectedDestination.value.coords)
  map.fitBounds(bounds, { padding: [36, 36] })
}

function initializeMap() {
  map = L.map(mapContainer.value, { zoomControl: false }).setView(currentLocation.coords, 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  updateMapScene()
}

onMounted(async () => {
  await nextTick()
  initializeMap()
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

watch(activeMode, updateMapScene)
watch(activeToggles, updateMapScene, { deep: true })
watch(selectedDestinationId, updateMapScene)
</script>

<template>
  <section class="map-stage" aria-label="Dev route planner map">
    <div ref="mapContainer" class="map-canvas"></div>

    <aside class="search-panel">
      <button type="button" class="location-button" @click="focusCurrentLocation">Current Location</button>
      <label class="search-field">
        <span>Q</span>
        <input v-model="destinationQuery" type="text" placeholder="Search location..." />
      </label>
      <div v-if="filteredDestinations.length" class="destination-list">
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
        <label v-for="toggle in devMapToggles" :key="toggle.key">
          <input type="checkbox" :checked="hasToggle(toggle.key)" @change="toggleLayer(toggle.key)" />
          <span :style="{ background: toggle.color }"></span>
          {{ toggle.label }}
        </label>
      </div>
    </aside>

    <aside class="detail-card">
      <div class="mode-tabs">
        <button
          v-for="mode in devRouteModes"
          :key="mode.id"
          type="button"
          :class="{ active: activeMode === mode.id }"
          @click="activeMode = mode.id"
        >
          {{ mode.label }}
        </button>
      </div>
      <div class="score-summary">
        <div class="shield">S</div>
        <div>
          <h2>Safety Score</h2>
          <p><strong>{{ activeProfile.score }}</strong> /10</p>
        </div>
      </div>
      <p><strong>Route Type:</strong> {{ activeProfile.routeType }}</p>
      <p class="summary-text">{{ activeProfile.subtitle }}</p>
      <p><strong>Risk Alerts:</strong></p>
      <ul>
        <li v-for="alert in activeAlerts" :key="alert"><span class="warning">!</span> {{ alert }}</li>
      </ul>
      <p><strong>Estimated Time:</strong></p>
      <p class="time">{{ activeProfile.time }}</p>
    </aside>

    <aside class="legend-card">
      <p>Legend</p>
      <span><i class="safe"></i> Safe routes</span>
      <span><i class="medium"></i> Risk areas</span>
      <span><i class="risk"></i> Popular spots</span>
    </aside>

    <section class="popular-card">
      <h2>Popular Routes</h2>
      <article v-for="route in devPopularRoutes" :key="route.id" @click="focusDestination(route.coords)">
        <span class="badge">{{ route.title.startsWith('Safe') ? 'S' : 'P' }}</span>
        <div>
          <strong>{{ route.title }}</strong>
          <p>{{ route.subtitle }}</p>
        </div>
        <img :src="route.image" :alt="route.title" />
      </article>
    </section>

    <section class="bottom-route-card">
      <div class="mode-tabs">
        <button
          v-for="mode in devRouteModes"
          :key="`bottom-${mode.id}`"
          type="button"
          :class="{ active: activeMode === mode.id }"
          @click="activeMode = mode.id"
        >
          {{ mode.label }}
        </button>
      </div>
      <div class="bottom-content">
        <div class="shield">S</div>
        <div>
          <h2>Safety Score</h2>
          <p><strong>{{ activeProfile.score }}</strong> /10</p>
          <p>Route Type: {{ activeProfile.routeType }}</p>
          <span>{{ activeProfile.time }} · to {{ selectedDestination?.name }}</span>
        </div>
        <button type="button" @click="focusDestination(selectedDestination.coords)">Start ></button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.map-stage { position: relative; min-height: 760px; max-width: 1180px; margin: 0 auto; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.45); background: linear-gradient(rgba(229, 244, 255, 0.16), rgba(229, 244, 255, 0.22)), #dbeafe; box-shadow: 0 22px 58px rgba(31, 68, 128, 0.24); }
:deep(.leaflet-container) { font: inherit; }
:deep(.dev-map-marker-wrapper) { background: transparent; border: 0; }
:deep(.dev-map-marker) { padding: 8px 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.92); box-shadow: 0 8px 18px rgba(31, 68, 128, 0.16); color: #476079; font-size: 0.85rem; font-weight: 800; text-align: center; }
:deep(.dev-map-marker.is-start) { background: #5b94ef; color: #ffffff; }
:deep(.dev-map-marker.is-popular) { background: #e9f6ee; color: #2f855f; }
.map-canvas { position: absolute; inset: 0; }
.search-panel, .detail-card, .legend-card, .popular-card, .bottom-route-card { position: absolute; z-index: 400; border-radius: 8px; background: rgba(255, 255, 255, 0.92); box-shadow: 0 12px 30px rgba(31, 68, 128, 0.15); }
.search-panel { top: 24px; left: 24px; width: 290px; padding: 12px; }
.location-button { width: 100%; min-height: 40px; border: 0; border-radius: 5px; background: #edf4ff; color: #506985; text-align: left; cursor: pointer; }
.search-field { display: flex; align-items: center; gap: 8px; min-height: 38px; margin-top: 8px; padding: 0 10px; border-radius: 5px; background: #f7faff; color: #66809e; }
.search-field input { width: 100%; min-width: 0; border: 0; background: transparent; }
.search-field input:focus { outline: none; }
.destination-list { display: grid; gap: 6px; margin-top: 10px; }
.destination-option { min-height: 34px; border: 0; border-radius: 5px; background: #eef4ff; color: #476079; text-align: left; cursor: pointer; }
.destination-option.active { background: #5b94ef; color: #ffffff; font-weight: 800; }
.toggle-list { display: grid; gap: 8px; margin-top: 12px; }
.toggle-list label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #476079; }
.toggle-list input { width: auto; }
.toggle-list span { width: 14px; height: 14px; border-radius: 4px; }
.detail-card { top: 146px; right: 24px; width: 320px; padding: 14px; color: #445a75; }
.mode-tabs { display: flex; overflow: hidden; border-radius: 6px; background: #edf3fb; }
.mode-tabs button { flex: 1; min-height: 34px; border: 0; background: transparent; color: #506985; cursor: pointer; }
.mode-tabs button.active { background: #5b94ef; color: #ffffff; font-weight: 800; }
.score-summary { display: flex; gap: 14px; align-items: center; margin-top: 18px; }
.shield { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 8px; background: #3d9b72; color: #ffffff; font-size: 1.6rem; font-weight: 900; }
.score-summary h2, .popular-card h2, .bottom-content h2 { margin: 0; color: #304765; font-size: 1.05rem; }
.score-summary p, .bottom-content p { margin: 4px 0; }
.score-summary strong, .bottom-content strong { color: #2f855f; font-size: 1.45rem; }
.summary-text { color: #60738a; }
.detail-card ul { display: grid; gap: 8px; margin: 6px 0 14px; padding: 0; list-style: none; }
.warning { color: #d6a42c; }
.time { color: #2f855f; font-weight: 800; }
.legend-card { left: 24px; bottom: 186px; width: 210px; padding: 14px; color: #526780; }
.legend-card p { margin: 0 0 8px; }
.legend-card span { display: flex; align-items: center; gap: 8px; margin: 7px 0; }
.legend-card i { width: 13px; height: 13px; border-radius: 50%; }
.safe { background: #3d9b72; }
.medium { background: #d6a42c; }
.risk { background: #d76666; }
.popular-card { left: 24px; bottom: 24px; width: 500px; padding: 14px; }
.popular-card article { display: grid; grid-template-columns: 30px 1fr 92px; gap: 10px; align-items: center; padding: 10px 0; color: #526780; cursor: pointer; }
.popular-card p { margin: 3px 0 0; }
.popular-card img { width: 92px; height: 48px; object-fit: cover; border-radius: 4px; }
.badge { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #edf4ff; }
.bottom-route-card { right: 24px; bottom: 24px; width: 470px; padding: 14px; }
.bottom-content { display: grid; grid-template-columns: 52px 1fr 116px; gap: 14px; align-items: center; margin-top: 14px; color: #526780; }
.bottom-content button { min-height: 44px; border: 0; border-radius: 5px; background: #3d9b72; color: #ffffff; cursor: pointer; font-weight: 800; }
@media (max-width: 980px) { .map-stage { min-height: 1180px; } .search-panel, .detail-card, .legend-card, .popular-card, .bottom-route-card { left: 16px; right: 16px; width: auto; } .detail-card { top: 228px; } .legend-card { bottom: 332px; } .popular-card { bottom: 160px; } .bottom-route-card { bottom: 16px; } }
@media (max-width: 640px) { .map-stage { min-height: auto; padding: 14px; display: grid; gap: 14px; } .map-canvas { position: relative; inset: auto; min-height: 320px; border-radius: 8px; overflow: hidden; } .search-panel, .detail-card, .legend-card, .popular-card, .bottom-route-card { position: relative; top: auto; right: auto; bottom: auto; left: auto; width: 100%; margin: 0; } .popular-card article { grid-template-columns: 28px 1fr; } .popular-card img { grid-column: 1 / -1; width: 100%; height: 132px; } .bottom-content { grid-template-columns: 52px 1fr; } .bottom-content button { grid-column: 1 / -1; width: 100%; } }
</style>
