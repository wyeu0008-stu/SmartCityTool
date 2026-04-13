<template>
  <BaseCard class="map-panel">
    <div class="map-header">
      <h3>Map Preview</h3>
      <span class="map-tag">Ready for Leaflet / Mapbox</span>
    </div>

    <div id="map" class="real-map"></div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../common/BaseCard.vue'
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let map
let routeLayer

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
  padding: 20px;
  margin-bottom: 28px;
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
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
}
</style>