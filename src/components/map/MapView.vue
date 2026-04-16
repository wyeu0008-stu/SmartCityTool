<template>
    <div class="map-page">
  
      <!-- 左边筛选 -->
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
  
      <!-- 右边地图 -->
      <div id="map" class="map"></div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  
  const layers = [
    { type: 'accident', label: '🚗 Accident' },
    { type: 'traffic', label: '🚦 Traffic' },
    { type: 'construction', label: '🚧 Construction' },
    { type: 'nolane', label: '🚴 No Lane' }
  ]
  
  const activeLayers = ref(['accident', 'traffic', 'construction', 'nolane'])
  
  const riskPoints = [
    { type: 'accident', coords: [-37.81, 144.96] },
    { type: 'traffic', coords: [-37.82, 144.97] },
    { type: 'construction', coords: [-37.83, 144.95] }
  ]
  
  let map
  let markers = []
  
  onMounted(() => {
    map = L.map('map').setView([-37.8136, 144.9631], 12)
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)
  
    drawPoints()
  })
  
  function drawPoints() {
    // 清除旧的
    markers.forEach(m => map.removeLayer(m))
    markers = []
  
    riskPoints.forEach(point => {
      if (!activeLayers.value.includes(point.type)) return
  
      const marker = L.circle(point.coords, {
        radius: 200,
        color: getColor(point.type),
        fillOpacity: 0.4
      }).addTo(map)
  
      markers.push(marker)
    })
  }
  
  function toggleLayer(type) {
    if (activeLayers.value.includes(type)) {
      activeLayers.value = activeLayers.value.filter(t => t !== type)
    } else {
      activeLayers.value.push(type)
    }
  
    drawPoints()
  }
  
  function getColor(type) {
    switch (type) {
      case 'accident': return 'red'
      case 'traffic': return 'blue'
      case 'construction': return 'orange'
      case 'nolane': return 'purple'
      default: return 'gray'
    }
  }
  </script>
  
  <style scoped>
  .map-page {
    display: flex;
    height: calc(100vh - 80px);
  }
  
  /* 左侧 */
  .sidebar {
    width: 260px;
    background: #f4f7fb;
    padding: 20px;
    border-right: 1px solid #e0e6ed;
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
  
  /* 地图 */
  .map {
    flex: 1;
  }
  </style>