<template>
  <BaseCard class="recommended-card">
    <div class="left-panel">
      <div class="shield-icon">🛡️</div>

      <div class="content-block">
        <h2>Recommended Safest Route</h2>
        <p class="route-type">Route Type: {{ route?.routeType || '-' }}</p>

        <ul class="alert-list">
          <li v-for="alert in route?.alerts || []" :key="alert.text">
            <span :class="['alert-icon', alert.level]">{{ alert.symbol }}</span>
            <span>{{ alert.text }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="right-panel">
      <div class="score-row">
        <span class="score-label">Safety Score</span>
        <div class="score-value">{{ route?.score ?? '-' }}<span>/10</span></div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(route?.score || 0) * 10}%` }"></div>
      </div>

      <div class="summary-box">
        <div class="summary-title">Safety Heads: &gt;</div>
        <div class="summary-pills">
          <span class="pill strong">{{ route?.score ?? '-' }}</span>
          <span class="pill neutral">{{ route?.time || '-' }}</span>
          <span class="pill soft">● {{ route?.risk || '-' }}</span>
        </div>
      </div>
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
.recommended-card {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  padding: 20px;
  margin-bottom: 34px;
}

.left-panel {
  display: flex;
  gap: 14px;
}

.shield-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #eafff2, #d3efdc);
  font-size: 1.35rem;
}

.content-block h2 {
  margin: 0;
  color: #34568f;
  font-size: 1.2rem;
}

.route-type {
  margin-top: 6px;
  color: #6b87ad;
}

.alert-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 10px;
}

.alert-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #567095;
}

.alert-icon.yellow {
  color: var(--warning);
}

.alert-icon.red {
  color: var(--danger);
}

.right-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.score-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.score-label {
  color: #5e79a0;
}

.score-value {
  color: #2f9b81;
  font-size: 2rem;
  font-weight: 800;
}

.score-value span {
  font-size: 1rem;
  color: #8ba3c2;
}

.progress-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e4ebf8;
  overflow: hidden;
  margin: 12px 0 18px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ea7d8, #6ec278);
}

.summary-box {
  background: rgba(236, 245, 255, 0.9);
  border-radius: 14px;
  padding: 14px;
}

.summary-title {
  color: #607ca4;
  font-weight: 700;
  margin-bottom: 10px;
}

.summary-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.92rem;
}

.pill.strong {
  background: #36a878;
  color: white;
}

.pill.neutral {
  background: #e7f0fd;
  color: #4a6a98;
}

.pill.soft {
  background: #edf8ec;
  color: #58a25a;
}

@media (max-width: 900px) {
  .recommended-card {
    grid-template-columns: 1fr;
  }
}
</style>