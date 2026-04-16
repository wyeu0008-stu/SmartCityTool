<template>
  <div class="map-page">

    <!-- 左侧筛选 -->
    <div class="sidebar">
      <h2>Hazard Layers</h2>

      <div
        v-for="layer in layers"
        :key="layer.type"
        class="layer"
        :class="{ active: activeLayers.includes(layer.type) }"
        @click="toggleLayer(layer.type)"
      >
        {{ layer.label }}
      </div>
    </div>

    <!-- 地图 -->
    <div id="map" class="map"></div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const layers = [
  { type: 'bike_parking', label: '🅿️ Bike Parking' }
]

const activeLayers = ref(['bike_parking'])

let map
let clusterGroup

function loadBikeParkingFromGeoJSON() {
  fetch('/bike_parking.geojson')
    .then(res => res.json())
    .then(data => {
      console.log('GeoJSON data:', data)

      const points = data.features.map(f => ({
        coords: [
          f.geometry.coordinates[1],
          f.geometry.coordinates[0]
        ],
        description: f.properties.amenity || 'Bike Parking'
      }))

      drawBikeParking(points)
    })
    .catch(err => {
      console.error('GeoJSON load failed', err)
    })
}

// ===== Bike Parking =====
function drawBikeParking(points) {
  if (clusterGroup) {
    map.removeLayer(clusterGroup)
  }

  clusterGroup = L.markerClusterGroup()

  points.slice(0, 500).forEach(point => {
    if (!activeLayers.value.includes('bike_parking')) return

    const marker = L.circleMarker(point.coords, {
      radius: 4,
      color: '#3388ff',
      fillOpacity: 0.6
    }).bindPopup(`<b>${point.description}</b>`)

    clusterGroup.addLayer(marker)
  })

  map.addLayer(clusterGroup)
}

// ===== 点击筛选 =====
function toggleLayer(type) {
  if (activeLayers.value.includes(type)) {
    activeLayers.value = []

    if (clusterGroup) {
      map.removeLayer(clusterGroup)
    }
  } else {
    activeLayers.value = [type]
    loadBikeParkingFromGeoJSON()
  }
}

onMounted(() => {
  map = L.map('map').setView([-37.8136, 144.9631], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  loadBikeParkingFromGeoJSON()

  setTimeout(() => {
    map.invalidateSize()
  }, 300)
})
</script>

<style scoped>
.map-page {
  display: flex;
  height: calc(100vh - 80px);
  background: #eef4fb;
}

.sidebar {
  width: 260px;
  background: #f4f7fb;
  padding: 20px;
}

.layer {
  background: white;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.layer.active {
  background: #dbeafe;
}

.map {
  flex: 1;
  height: 100%;
  margin: 16px;
  border-radius: 12px;
}
</style>