<template>
  <BaseCard class="map-panel">
    <div class="map-header">
      <h3>Map Preview</h3>
      <span class="map-tag">Ready for Leaflet / Mapbox</span>
    </div>

    <div class="map-placeholder">
      <div class="map-label">Map Module Placeholder</div>
      <p>
        Selected route: <strong>{{ route?.name || 'None' }}</strong>
      </p>
      <p>
        Later you can replace this component with Leaflet or Mapbox,
        then draw polylines, markers, and safety layers.
      </p>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from '../common/BaseCard.vue'

defineProps({
  route: {
    type: Object,
    default: null
  }
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
</style>