<template>
  <BaseCard class="map-panel">
    <div class="map-layout">
      <!-- LEFT: MAP -->
      <div class="map-left">
        <div class="map-header">
          <h3>Live Traffic Map Preview</h3>
          <span class="map-time">UPDATED {{ currentTime }} ↗</span>
        </div>

        <div id="map" class="real-map"></div>

      </div>

    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../common/BaseCard.vue'
import { onMounted } from 'vue'
import { ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
const currentTime = ref('')

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
}

let map
let routeLayer
const TOMTOM_KEY = 'u9ZdHP1X7qv2EMC65jrFu8dCV3PLEk8E'

function drawRoute(coords) {
  if (routeLayer) {
    map.removeLayer(routeLayer)
  }
  routeLayer = L.polyline(coords, {
    color: 'green',
    weight: 5
  }).addTo(map)
}

function loadTrafficGrid() {
  // 🌏 Melbourne bounding box (限制范围，避免请求全世界)
  const MELB_BOUND = {
    south: -38.2,
    north: -37.5,
    west: 144.5,
    east: 145.3
  }

  const bounds = map.getBounds()

  // 👉 当前视野 + 限制在 Melbourne 内
  const south = Math.max(bounds.getSouth(), MELB_BOUND.south)
  const north = Math.min(bounds.getNorth(), MELB_BOUND.north)
  const west = Math.max(bounds.getWest(), MELB_BOUND.west)
  const east = Math.min(bounds.getEast(), MELB_BOUND.east)

  // ⚠️ 控制密度（避免 API 爆）
  const step = 0.03

  for (let lat = south; lat <= north; lat += step) {
    for (let lon = west; lon <= east; lon += step) {

      fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&key=${TOMTOM_KEY}`)
        .then(res => res.json())
        .then(data => {
          const flow = data.flowSegmentData
          if (!flow || !flow.coordinates) return

          const speed = flow.currentSpeed
          const free = flow.freeFlowSpeed

          // Only show medium + high congestion (remove green / low traffic)
          let color = null
          if (speed < free * 0.5) {
            color = '#cc0000'   // heavy traffic (red)
          } else if (speed < free * 0.8) {
            color = '#ff8c00'   // medium traffic (orange)
          }

          // skip low traffic (too many, not useful)
          if (!color) return

          const coords = flow.coordinates.coordinate
          const latlngs = coords.map(c => [c.latitude, c.longitude])

          L.polyline(latlngs, {
            color: color,
            weight: 6,
            opacity: 0.9,
            lineCap: 'round'
          })
          .bindPopup(`Speed: ${speed} km/h`)
          .addTo(map)

        })
        .catch(err => {
          console.error('Traffic API error', err)
        })
    }
  }
}

defineProps({
  route: {
    type: Object,
    default: null
  }
})

onMounted(() => {
  updateTime()
  map = L.map('map').setView([-37.8136, 144.9631], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  // ===== Load Traffic (TomTom API) =====
  loadTrafficGrid()
  map.on('moveend', () => {
    loadTrafficGrid()
  })
})
</script>

<style scoped>
.map-panel {
  padding: 24px 24px;          
  border-radius: 28px;
  background: #eef5fb;
  margin: 40px auto;
  width: 100%;
  max-width: 100%;        
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 16px 50px rgba(0,0,0,0.10);
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.map-header h3 {
  margin: 0;
  color: #36588f;
  font-size: 30px;
}

.map-time {
  font-size: 1.05rem;
  color: #7a8da5;
}

.map-tag {
  font-size: 0.86rem;
  color: #5d7aa2;
  background: rgba(232, 241, 255, 0.88);
  padding: 6px 10px;
  border-radius: 999px;
}

.map-placeholder {
  min-height: 260px;
  border-radius: 16px;
  border: 1px dashed #aac3ef;
  background:
    linear-gradient(rgba(255,255,255,0.32), rgba(255,255,255,0.32)),
    linear-gradient(180deg, #dceaff 0%, #edf5ff 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 24px;
  color: #55729a;
}

.map-label {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 10px;
  color: #35588e;
}

.real-map {
  height: 700px;             
  overflow: hidden;
}

.legend {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.legend-item {
  background: #e6edf5;
  padding: 20px 24px;
  border-radius: 18px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.blue { background: blue; }

.icon {
  font-size: 26px;
}
</style>
<style scoped>
.map-layout {
  display: flex;
  gap: 32px;
  width: 100%;
}

.map-left {
  flex: 1;
  width: 100%;
}

.map-right {
  width: 260px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: stretch;
  justify-content: space-between;
  padding-top: 24px;
}

.risk-card {
  background: #eaf3fb;
  border-radius: 20px;
  padding: 20px;
  text-align: left;
}

.risk-card .icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.risk-card h4 {
  margin: 0 0 6px;
}

.tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag.high {
  background: #ffe5e5;
  color: red;
}

.tag.moderate {
  background: #e6ecff;
  color: #4c6ef5;
}

.tag.low {
  background: #e6f7f0;
  color: #2f9e44;
}

.legend-right {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 900px) {
  .map-layout {
    flex-direction: column;
  }
}
</style>