<template>
  <div class="map-page">

    <div class="sidebar">
      <h2>Map Filters</h2>

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
import Papa from 'papaparse'

const layers = [
  { type: 'accident', label: '🚗 Accident' },
  { type: 'bike_parking', label: '🅿️ Bike Parking' },
  { type: 'bike_lane', label: '🚴 Bike Lane' },
]

const activeLayers = ref(['bike_parking'])

let map
let clusterGroup
let bikeLaneLayer

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

function loadAccidents() {
  fetch('/node.csv')
    .then(res => res.text())
    .then(csv => {
      const parsed = Papa.parse(csv, { header: true })

      const points = parsed.data
        .filter(row => row.LATITUDE && row.LONGITUDE)
        .map(row => ({
          coords: [
            parseFloat(row.LATITUDE),
            parseFloat(row.LONGITUDE)
          ],
          description: 'Accident'
        }))
        .slice(0, 500)

      drawAccidents(points)
    })
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

function drawBikeParking(points) {
  if (clusterGroup) {
    map.removeLayer(clusterGroup)
  }

  clusterGroup = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount()

      // Glassmorphism border color logic
      let borderColor = 'rgba(0,160,0,0.8)'
      if (count > 15) {
        borderColor = 'rgba(220,0,0,0.9)'
      } else if (count > 5) {
        borderColor = 'rgba(255,150,0,0.9)'
      }

      return L.divIcon({
        html: `<div style="
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 2px solid ${borderColor};
          border-radius: 50%;
          color: #222;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          font-size: 14px;
        ">${count}</div>`,
        className: 'custom-cluster',
        iconSize: [40, 40]
      })
    }
  })

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

function drawAccidents(points) {
  if (clusterGroup) {
    map.removeLayer(clusterGroup)
  }

  clusterGroup = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      const count = cluster.getChildCount()

      // Glassmorphism border color logic
      let borderColor = 'rgba(0,160,0,0.8)'
      if (count > 15) {
        borderColor = 'rgba(220,0,0,0.9)'
      } else if (count > 5) {
        borderColor = 'rgba(255,150,0,0.9)'
      }

      return L.divIcon({
        html: `<div style="
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 2px solid ${borderColor};
          border-radius: 50%;
          color: #222;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          font-size: 14px;
        ">${count}</div>`,
        className: 'custom-cluster',
        iconSize: [40, 40]
      })
    }
  })

  points.forEach(point => {
    if (!activeLayers.value.includes('accident')) return

    const marker = L.circleMarker(point.coords, {
      radius: 4,
      color: 'red',
      fillOpacity: 0.6
    }).bindPopup(`<b>Accident</b>`)

    clusterGroup.addLayer(marker)
  })

  map.addLayer(clusterGroup)
}

function drawBikeLanes(features) {
  if (bikeLaneLayer) {
    map.removeLayer(bikeLaneLayer)
  }

  bikeLaneLayer = L.geoJSON(features, {
    style: {
      color: '#007AFF',
      weight: 3,
      opacity: 0.7
    }
  })

  if (activeLayers.value.includes('bike_lane')) {
    bikeLaneLayer.addTo(map)
  }
}

function toggleLayer(type) {
  if (activeLayers.value.includes(type)) {
    activeLayers.value = activeLayers.value.filter(t => t !== type)

    if (clusterGroup) {
      map.removeLayer(clusterGroup)
    }
    if (type === 'bike_lane' && bikeLaneLayer) {
      map.removeLayer(bikeLaneLayer)
    }
  } else {
    activeLayers.value.push(type)

    if (type === 'bike_parking') {
      loadBikeParkingFromGeoJSON()
    }

    if (type === 'accident') {
      loadAccidents()
    }

    if (type === 'bike_lane') {
      loadBikeLanes()
    }
  }
}

onMounted(() => {
  map = L.map('map').setView([-37.8136, 144.9631], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

<<<<<<< HEAD
  // 📍 User location (location function)
=======
>>>>>>> 74bbfec109149c444e924d5168b0f80a3db58a2d
  const locateControl = L.control({ position: 'topleft' })

  locateControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
    div.innerHTML = '📍'
    div.style.cursor = 'pointer'
    div.style.background = 'white'
    div.style.padding = '6px'
    div.style.fontSize = '18px'

    div.onclick = () => {
      map.locate({ setView: true, maxZoom: 16 })
    }

    return div
  }

  locateControl.addTo(map)

<<<<<<< HEAD
  // Successful positioning
=======
>>>>>>> 74bbfec109149c444e924d5168b0f80a3db58a2d
  map.on('locationfound', (e) => {
    L.circleMarker(e.latlng, {
      radius: 6,
      color: '#007AFF',
      fillOpacity: 0.8
    }).addTo(map)
      .bindPopup('You are here')
      .openPopup()
  })

<<<<<<< HEAD
  // Location failed
=======
>>>>>>> 74bbfec109149c444e924d5168b0f80a3db58a2d
  map.on('locationerror', () => {
    alert('Unable to get your location')
  })

  loadBikeParkingFromGeoJSON()
  loadAccidents()
  loadBikeLanes()

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