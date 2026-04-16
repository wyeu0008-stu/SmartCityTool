<script setup>
import TodayOverviewCard from '../components/safety/TodayOverviewCard.vue'
import TrafficNewsPanel from '../components/safety/TrafficNewsPanel.vue'
import { useWeather } from '../composables/useWeather'
import { useTrafficNews } from '../composables/useTrafficNews'

const { weather, loading: weatherLoading, error: weatherError } = useWeather()
const { news, loading: newsLoading, error: newsError } = useTrafficNews()

const dateText = new Date().toLocaleDateString('en-AU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
</script>

<template>
  <div class="page-container">
    <section class="hero-section">
      <h1 class="hero-title">Safety Insights</h1>
      <p class="hero-subtitle">
        Real-time weather, daily context, and local traffic-related cycling news.
      </p>
    </section>

    <div class="content-grid">
      <TodayOverviewCard
        :date-text="dateText"
        :weather="weather"
        :loading="weatherLoading"
        :error="weatherError"
      />

      <TrafficNewsPanel
        :news="news"
        :loading="newsLoading"
        :error="newsError"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 28px 24px 40px;
}

.hero-section {
  text-align: center;
  padding: 24px 16px 30px;
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #274a87;
}

.hero-subtitle {
  margin-top: 14px;
  color: #4c6692;
  line-height: 1.6;
  font-size: 1.05rem;
}

.content-grid {
  display: grid;
  gap: 24px;
}

.news-panel {
  padding: 26px;
  border-radius: 20px;

  background: linear-gradient(135deg, #f8fbff, #eef4ff);
  border: 1px solid #dfe8f5;
}

.page-container {
  background: linear-gradient(180deg, #f7fbff, #ffffff);
}
</style>