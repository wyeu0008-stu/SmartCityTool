<template>
  <div class="map-page">

    <!-- LEFT SIDEBAR -->
    <div class="sidebar">
      <h2>Map Filters</h2>

      <div
        v-for="layer in layers"
        :key="layer.type"
        class="layer"
        :class="{ active: activeLayer === layer.type }"
        @click="toggleLayer(layer.type)"
      >
        {{ layer.label }}
      </div>
    </div>

    <!-- MAP -->
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
  { type: 'bike_parking', label: '🅿️ Bike Parking' },
  { type: 'bike_lane', label: '🚴 Bike Lane' },
]

const activeLayer = ref('bike_parking')

let map
let clusterGroup
let bikeLaneLayer
let userPath = []
let pathLayer
let routeLayer

function loadBikeParkingFromGeoJSON() {
  fetch('/bike_parking.geojson')
    .then(res => res.json())
    .then(data => {

      const points = data.features.map(f => ({
        coords: [
          f.geometry.coordinates[1],
          f.geometry.coordinates[0]
        ],
        description: f.properties.amenity || 'Bike Parking'
      }))

      drawBikeParking(points)
    })
    .catch(err => console.error(err))
}

function drawBikeParking(points) {
  if (clusterGroup) {
    map.removeLayer(clusterGroup)
  }

  clusterGroup = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount()

      let borderColor = '#4caf50' 
      if (count > 50) borderColor = '#e53935'   
      else if (count > 15) borderColor = '#fb8c00' 
      else if (count > 5) borderColor = '#fbc02d'  

      return L.divIcon({
        html: `<div style="
          background: white;
          border: 3px solid ${borderColor};
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: black;
        ">${count}</div>`,
        className: '',
        iconSize: [40, 40]
      })
    }
  })

  points.slice(0, 500).forEach(point => {
    const marker = L.circleMarker(point.coords, {
      radius: 4,
      color: '#3388ff',
      fillOpacity: 0.6
    })
    .bindPopup(`<b>${point.description}</b><br/>Click to navigate`)
    .on('click', () => {
      if (userPath.length === 0) {
        alert('Get your location first')
        return
      }

      const start = userPath[userPath.length - 1]
      const end = point.coords

      getRoute(start, end)
    })

    clusterGroup.addLayer(marker)
  })

  map.addLayer(clusterGroup)
}

function loadBikeLanes() {
  fetch('/bike_line.geojson')
    .then(res => res.json())
    .then(data => {

      const cleanData = data.features.filter(f => {
        return (
          f.geometry.type === "LineString" &&
          f.properties.highway === "cycleway" &&
          f.properties.access !== "private"
        )
      })

      drawBikeLanes(cleanData)
    })
}

function drawBikeLanes(features) {
  if (bikeLaneLayer) {
    map.removeLayer(bikeLaneLayer)
  }

  bikeLaneLayer = L.geoJSON(features, {
    style: {
      color: '#0050FF',   
      weight: 4,
      opacity: 0.85
    }
  })

  bikeLaneLayer.addTo(map)
}

function getRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/bike/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.routes || data.routes.length === 0) return

      const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
      const distance = data.routes[0].distance / 1000 // km
      const duration = data.routes[0].duration / 60   // minutes

      if (routeLayer) {
        map.removeLayer(routeLayer)
      }

      routeLayer = L.polyline(coords, {
        color: '#003366',
        weight: 5
      })
      .bindPopup(`
        🚴 Distance: ${distance.toFixed(2)} km<br/>
        ⏱ Time: ${duration.toFixed(0)} min
      `)
      .addTo(map)

      map.fitBounds(routeLayer.getBounds())
      routeLayer.openPopup()
    })
    .catch(err => console.error('Route error:', err))
}

function toggleLayer(type) {

  activeLayer.value = type

  if (clusterGroup) map.removeLayer(clusterGroup)
  if (bikeLaneLayer) map.removeLayer(bikeLaneLayer)
  if (type === 'bike_parking') {
    loadBikeParkingFromGeoJSON()
  }

  if (type === 'bike_lane') {
    loadBikeLanes()
  }
}

onMounted(() => {
  map = L.map('map').setView([-37.8136, 144.9631], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  const locateControl = L.control({ position: 'topleft' })

  locateControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
    div.innerHTML = '📍'
    div.style.cursor = 'pointer'
    div.style.background = 'white'
    div.style.padding = '6px'

    div.onclick = () => {
      map.locate({ setView: true, maxZoom: 16 })
    }

    return div
  }

  locateControl.addTo(map)
  map.locate({ watch: true, setView: false })

  map.on('locationfound', (e) => {
    const latlng = [e.latlng.lat, e.latlng.lng]

    // store path
    userPath.push(latlng)

    // draw/update path
    if (pathLayer) {
      map.removeLayer(pathLayer)
    }

    pathLayer = L.polyline(userPath, {
      color: '#007AFF',
      weight: 5,
      opacity: 0.8
    }).addTo(map)

    // show current location
    L.circleMarker(e.latlng, {
      radius: 6,
      color: '#007AFF',
      fillOpacity: 0.8
    }).addTo(map)
      .bindPopup('You are here')
      .openPopup()
  })

  map.on('locationerror', () => {
    alert('Unable to get your location')
  })

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
  transition: 0.2s;
}

.layer.active {
  background: #dbeafe;
  font-weight: bold;
}

.map {
  flex: 1;
  height: 100%;
  margin: 16px;
  border-radius: 12px;
}
</style>