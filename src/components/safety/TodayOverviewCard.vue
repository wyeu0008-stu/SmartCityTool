<script setup>
defineProps({
  dateText: {
    type: String,
    default: ''
  },
  weather: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section class="today-card glass-card">
    <div class="card-header">
      <h2>Today’s Safety Snapshot</h2>
      <span class="date">{{ dateText }}</span>
    </div>

    <div v-if="loading" class="status-text">Loading weather...</div>
    <div v-else-if="error" class="status-text error">{{ error }}</div>

    <div v-else class="weather-grid">
      <div class="weather-item">
        <span class="label">Temperature</span>
        <span class="value">{{ weather.temperature ?? '--' }}°C</span>
      </div>

      <div class="weather-item">
        <span class="label">Wind Speed</span>
        <span class="value">{{ weather.windSpeed ?? '--' }} km/h</span>
      </div>

      <div class="weather-item">
        <span class="label">Weather</span>
        <span class="value">{{ weather.description || '--' }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.today-card {
  padding: 26px;
  border-radius: 20px;

  background: linear-gradient(135deg, #eef4ff, #f7fbff);
  border: 1px solid #dfe8f5;

  box-shadow: 0 10px 30px rgba(60, 100, 180, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
  color: #274a87;
}

.date {
  color: #5e7698;
  font-weight: 600;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.weather-item {
  padding: 18px;
  border-radius: 16px;

  background: white;
  border: 1px solid #e6edf5;

  transition: all 0.2s ease;
}

.weather-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(80, 120, 200, 0.12);
}

.label {
  display: block;
  margin-bottom: 8px;
  color: #6982a3;
  font-size: 0.92rem;
}

.value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #2f6f4f;   
}

.status-text {
  color: #6982a3;
}

.status-text.error {
  color: #c34f4f;
}

@media (max-width: 768px) {
  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>