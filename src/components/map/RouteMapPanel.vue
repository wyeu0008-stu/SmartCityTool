<template>
  <BaseCard class="map-panel">
    <div class="map-layout">
      <!-- LEFT: MAP -->
      <div class="map-left">
        <div class="map-header">
          <h3>Live Risk Map Preview</h3>
          <span class="map-time">UPDATED 01:13:49 ↗</span>
        </div>

        <div id="map" class="real-map"></div>

      </div>

      <!-- RIGHT: LEGEND -->
      <div class="map-right">
        <div class="legend legend-right">
          <div class="legend-item">
            <span class="icon">🚗</span>
            <span class="dot red"></span> Accident 2
          </div>

          <div class="legend-item">
            <span class="icon">🚦</span>
            <span class="dot blue"></span> Traffic 0
          </div>

          <div class="legend-item">
            <span class="icon">🚴</span>
            <span class="dot purple"></span> No Lane 0
          </div>

          <div class="legend-item">
            <span class="icon">🚧</span>
            <span class="dot orange"></span> Construction 1
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../common/BaseCard.vue'
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map
let routeLayer

const risks = [
  { lat: -37.81, lng: 144.96, type: 'accident' },
  { lat: -37.82, lng: 144.98, type: 'accident' },
  { lat: -37.80, lng: 144.95, type: 'construction' },
  { lat: -37.83, lng: 144.97, type: 'safe' }
]

function getColor(type) {
  if (type === 'accident') return 'red'
  if (type === 'construction') return 'orange'
  if (type === 'safe') return 'green'
  if (type === 'traffic') return 'blue'
  return 'purple'
}

function drawRoute(coords) {
  if (routeLayer) {
    map.removeLayer(routeLayer)
  }
  routeLayer = L.polyline(coords, {
    color: 'green',
    weight: 5
  }).addTo(map)
}

defineProps({
  route: {
    type: Object,
    default: null
  }
})

onMounted(() => {
  map = L.map('map').setView([-37.8136, 144.9631], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  risks.forEach(risk => {
    L.circleMarker([risk.lat, risk.lng], {
      radius: 8,
      color: getColor(risk.type),
      fillOpacity: 0.8
    })
    .bindPopup(`Risk: ${risk.type}`)
    .addTo(map)
  })

  // default route
  drawRoute([
    [-37.8136, 144.9631],
    [-37.8150, 144.9700],
    [-37.8200, 144.9750]
  ])
})
</script>

<style scoped>
.map-panel {
  padding: 24px 24px;          /* reduce left/right padding so content expands */
  border-radius: 28px;
  background: #eef5fb;
  margin: 40px auto;
  width: 100%;
  max-width: 100%;           /* increase width */
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
  height: 700px;               /* increase for better presence */
  border-radius: 18px;
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

.red { background: red; }
.blue { background: blue; }
.purple { background: purple; }
.orange { background: orange; }

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