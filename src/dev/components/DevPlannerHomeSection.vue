<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { devRouteOptions } from '../services/devPlannerContentService'

const router = useRouter()
const destination = ref('')
const safestRoute = computed(() => devRouteOptions[0])

function openMap() {
  router.push('/dev/map')
}
</script>

<template>
  <section class="hero-panel">
    <div class="hero-copy">
      <h1>SmartCycle Navigator</h1>
      <p>Pre-release testing environment for SmartCycle planning</p>
      <p>Use this build to validate changes before release</p>
    </div>

    <form class="route-search" @submit.prevent="openMap">
      <label class="field current-location">
        <span class="pin-icon">O</span>
        <input value="Current Location" readonly />
      </label>
      <label class="field">
        <span class="pin-icon hollow">O</span>
        <input v-model="destination" placeholder="Enter Destination" />
        <button type="button" class="field-menu" aria-label="Choose destination">v</button>
      </label>
      <button class="find-button" type="submit">Test Safest Route</button>
    </form>

    <section class="recommendation-card" aria-label="Recommended safest route">
      <div class="route-main">
        <div class="shield">S</div>
        <div>
          <h2>Recommended Preview Route</h2>
          <p>Route Type: {{ safestRoute.routeType || 'Protected Lanes' }}</p>
        </div>
      </div>

      <div class="route-score">
        <span>Safety Score</span>
        <strong>{{ safestRoute.score }}</strong>
        <span>/10</span>
        <div class="score-bar">
          <span :style="{ width: `${safestRoute.score * 10}%` }"></span>
        </div>
      </div>

      <ul class="route-alerts">
        <li><span class="warning">!</span> Preview alert coverage enabled</li>
        <li><span class="warning">!</span> Testing route parity with release layout</li>
        <li><span class="danger">!</span> Validate risk scoring before production merge</li>
      </ul>

      <div class="route-stats">
        <button type="button" @click="openMap">Open Dev Map &gt;</button>
        <strong>{{ safestRoute.score }}</strong>
        <span>{{ safestRoute.time }}</span>
        <small>{{ safestRoute.risk }}</small>
      </div>
    </section>

    <section class="compare-section" aria-label="Compare routes">
      <h2>Compare Preview Routes</h2>
      <div class="compare-grid">
        <article v-for="route in devRouteOptions" :key="route.id" class="compare-card">
          <h3>{{ route.name }} <span>({{ route.label }})</span></h3>
          <div class="metric-row">
            <strong :style="{ background: route.color }">{{ route.score }}</strong>
            <span>{{ route.time }}</span>
            <small>{{ route.risk }}</small>
          </div>
          <button type="button" :style="{ background: route.color }" @click="openMap">Test Route</button>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.hero-panel {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 24px 28px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background:
    linear-gradient(rgba(235, 244, 255, 0.7), rgba(235, 244, 255, 0.62)),
    url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover;
  box-shadow: 0 22px 58px rgba(31, 68, 128, 0.24);
}

.hero-panel::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 170px;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(214, 234, 255, 0.9));
  pointer-events: none;
}

.hero-copy,
.route-search,
.recommendation-card,
.compare-section {
  position: relative;
  z-index: 1;
  width: min(100%, 1040px);
  margin-inline: auto;
}

.hero-copy { text-align: center; color: #24406f; }
.hero-copy h1 { margin: 0 0 10px; font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.08; }
.hero-copy p { margin: 5px 0; font-size: 1.05rem; }
.route-search { display: grid; gap: 8px; margin-top: 34px; padding: 12px; border-radius: 8px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 12px 30px rgba(31, 68, 128, 0.12); }
.field { display: grid; grid-template-columns: 24px 1fr 32px; align-items: center; min-height: 46px; padding: 0 8px; border-bottom: 1px solid #e3ebf5; }
.field.current-location { grid-template-columns: 24px 1fr; }
.pin-icon { color: #5b94ef; font-size: 0.9rem; }
.pin-icon.hollow { color: #6f9be0; }
.field input { width: 100%; min-width: 0; border: 0; background: transparent; color: #526780; }
.field input:focus { outline: none; }
.field-menu { border: 0; background: transparent; color: #6b7a8c; cursor: pointer; }
.find-button, .compare-card button, .route-stats button { border: 0; border-radius: 5px; color: #ffffff; cursor: pointer; font-weight: 800; }
.find-button { min-height: 48px; background: #2f855f; font-size: 1rem; }
.recommendation-card { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr); gap: 18px 24px; margin-top: 28px; padding: 20px; border-radius: 8px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 14px 34px rgba(31, 68, 128, 0.14); }
.route-main { display: flex; gap: 14px; align-items: center; }
.shield { display: grid; flex: 0 0 auto; place-items: center; width: 52px; height: 52px; border-radius: 8px; background: #3d9b72; color: #ffffff; font-size: 1.6rem; font-weight: 900; }
.route-main h2, .compare-section h2 { margin: 0; color: #304765; font-size: 1.15rem; }
.route-main p { margin: 8px 0 0; color: #6b7a8c; }
.route-score { color: #304765; }
.route-score strong { margin-left: 12px; color: #2f855f; font-size: 1.45rem; }
.score-bar { height: 9px; margin-top: 12px; overflow: hidden; border-radius: 99px; background: #dde7f2; }
.score-bar span { display: block; height: 100%; background: #3d9b72; }
.route-alerts { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; color: #435772; }
.warning { color: #d6a42c; }
.danger { color: #d76666; }
.route-stats { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.route-stats button { padding: 10px 14px; background: #edf4ff; color: #3765a9; }
.route-stats strong { padding: 9px 14px; border-radius: 5px; background: #2f855f; color: #ffffff; }
.route-stats small { color: #3d9b72; }
.compare-section { margin-top: 28px; text-align: center; }
.compare-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
.compare-card { padding: 16px; border-radius: 8px; background: rgba(255, 255, 255, 0.92); text-align: left; box-shadow: 0 12px 28px rgba(31, 68, 128, 0.12); }
.compare-card h3 { margin: 0 0 14px; color: #304765; font-size: 1rem; }
.compare-card h3 span { color: #7b8da3; }
.metric-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; color: #40556f; }
.metric-row strong { padding: 8px 12px; border-radius: 4px; color: #ffffff; }
.metric-row small { margin-left: auto; }
.compare-card button { width: 100%; min-height: 42px; margin-top: 16px; }
@media (max-width: 900px) { .recommendation-card, .compare-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .hero-panel { padding: 26px 14px 20px; } .hero-copy { text-align: left; } .hero-copy h1 { font-size: 2rem; } .hero-copy p { font-size: 0.98rem; } .route-search, .recommendation-card, .compare-card { padding: 14px; } .field { min-height: 44px; padding: 0 4px; } .route-main { align-items: flex-start; } .route-score strong { margin-left: 8px; } .route-stats { justify-content: flex-start; } .metric-row { align-items: flex-start; } .metric-row small { margin-left: 0; } .find-button { width: 100%; } }
</style>
