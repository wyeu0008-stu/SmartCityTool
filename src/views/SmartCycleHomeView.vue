<template>
  <div class="page-container">
    <div class="page-background"></div>

    <div class="page-shell">
      <AppHeader />

      <section class="hero-section">
        <h1 class="hero-title">SmartCycle Navigator</h1>
        <p class="hero-subtitle">
          A Smart Cycling Safety and Decision Support System<br />
          Using Open Mobility Data
        </p>
      </section>

      <RouteSearchCard
        v-model:currentLocation="currentLocation"
        v-model:destination="destination"
        :loading="loading"
        @submit="loadRoutes"
      />

      <p v-if="error" class="error-text">{{ error }}</p>

      <RecommendedRouteCard :route="recommendedRoute" />

      <RouteMapPanel :route="selectedRoute" />

      <RouteCompareSection
        :routes="routes"
        :selected-route-id="selectedRouteId"
        @view-route="selectRoute"
        @compare-all="handleCompareAll"
      />

      <div class="bike-illustration">🚴‍♂️</div>
    </div>
  </div>
</template>
<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import RouteSearchCard from '../components/search/RouteSearchCard.vue'
import RecommendedRouteCard from '../components/route/RecommendedRouteCard.vue'
import RouteCompareSection from '../components/route/RouteCompareSection.vue'
import RouteMapPanel from '../components/map/RouteMapPanel.vue'
import { useRoutes } from '../composables/useRoutes'

const {
  currentLocation,
  destination,
  routes,
  loading,
  error,
  recommendedRoute,
  selectedRoute,
  selectedRouteId,
  loadRoutes,
  selectRoute
} = useRoutes()

function handleCompareAll() {
  console.log('Compare all routes', routes.value)
}
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 42px 16px 28px;
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
  font-size: 1.1rem;
}

.error-text {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 236, 236, 0.95);
  color: #c34f4f;
  border: 1px solid rgba(227, 145, 145, 0.35);
}

.bike-illustration {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  font-size: 3rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .hero-section {
    padding-top: 28px;
  }
}
</style>