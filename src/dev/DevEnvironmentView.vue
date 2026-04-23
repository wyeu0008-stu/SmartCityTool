<script setup>
import { computed, ref } from 'vue'
import {
  buildRiskSummary,
  createMapPlan,
  filterRoutesBySafety,
  getRecommendedRoute,
  sortRoutesByMode
} from './routePlannerFunctions'

const selectedMode = ref('safest')
const minimumScore = ref(6)

const prototypeRoutes = [
  {
    id: 'safe-lane',
    name: 'Protected Lane Route',
    score: 8.5,
    minutes: 18,
    distanceKm: 4.8,
    riskWeight: 1,
    protectedLanePercent: 82,
    alerts: ['High traffic area ahead', 'Intersection with heavy traffic']
  },
  {
    id: 'quick-link',
    name: 'Fast Urban Link',
    score: 6.7,
    minutes: 15,
    distanceKm: 5.1,
    riskWeight: 3,
    protectedLanePercent: 46,
    alerts: ['Dangerous intersection', 'Limited cycle lane coverage']
  },
  {
    id: 'short-hop',
    name: 'Shortest Mixed Route',
    score: 5.8,
    minutes: 16,
    distanceKm: 3.9,
    riskWeight: 4,
    protectedLanePercent: 38,
    alerts: ['Narrow lane section']
  }
]

const sortedRoutes = computed(() => sortRoutesByMode(prototypeRoutes, selectedMode.value))
const recommendedRoute = computed(() => getRecommendedRoute(prototypeRoutes, selectedMode.value))
const eligibleRoutes = computed(() => filterRoutesBySafety(prototypeRoutes, minimumScore.value))
const riskSummary = computed(() => buildRiskSummary(recommendedRoute.value))
const mapPlan = computed(() => createMapPlan('Current Location', 'New Park', recommendedRoute.value))
</script>

<template>
  <main class="dev-page">
    <section class="dev-shell">
      <div class="dev-copy">
        <p class="eyebrow">Development Environment</p>
        <h1>Route Planner Function Prototype</h1>
        <p>
          This area previews the Release route planning design while the function
          JS is prepared for scoring, sorting, filtering, and map-plan creation.
        </p>
      </div>

      <div class="prototype-grid">
        <section class="control-panel">
          <h2>Planner Controls</h2>
          <div class="segmented">
            <button
              v-for="mode in ['safest', 'fastest', 'shortest']"
              :key="mode"
              type="button"
              :class="{ active: selectedMode === mode }"
              @click="selectedMode = mode"
            >
              {{ mode }}
            </button>
          </div>

          <label class="score-control">
            Minimum safety score
            <input v-model.number="minimumScore" type="range" min="0" max="10" step="0.5" />
            <strong>{{ minimumScore }}</strong>
          </label>
        </section>

        <section class="result-panel">
          <h2>Recommended Route</h2>
          <article v-if="recommendedRoute" class="route-card">
            <div class="shield">S</div>
            <div>
              <h3>{{ recommendedRoute.name }}</h3>
              <p>Score {{ recommendedRoute.score }} / 10 · {{ recommendedRoute.minutes }} mins</p>
            </div>
          </article>

          <div class="summary-list">
            <p v-for="item in riskSummary" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </p>
          </div>
        </section>

        <section class="list-panel">
          <h2>Sorted Routes</h2>
          <ol>
            <li v-for="route in sortedRoutes" :key="route.id">
              <span>{{ route.name }}</span>
              <strong>{{ route.score }} / {{ route.minutes }}m</strong>
            </li>
          </ol>
        </section>

        <section class="list-panel">
          <h2>Eligible Routes</h2>
          <ol>
            <li v-for="route in eligibleRoutes" :key="route.id">
              <span>{{ route.name }}</span>
              <strong>{{ route.protectedLanePercent }}%</strong>
            </li>
          </ol>
        </section>

        <section class="json-panel">
          <h2>Map Plan JS Output</h2>
          <pre>{{ mapPlan }}</pre>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dev-page {
  min-height: calc(100vh - 80px);
  padding: 24px;
  background: #78a9f4;
}

.dev-shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: 42px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background:
    linear-gradient(rgba(235, 244, 255, 0.82), rgba(235, 244, 255, 0.74)),
    url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover;
  box-shadow: 0 22px 58px rgba(31, 68, 128, 0.24);
}

.dev-copy {
  max-width: 760px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #2f6f4f;
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #1f2d3d;
  font-size: clamp(2.2rem, 5vw, 4rem);
  line-height: 1.05;
}

p {
  max-width: 680px;
  margin: 18px 0 0;
  color: #5a6b7b;
  font-size: 1.08rem;
  line-height: 1.7;
}

.prototype-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 34px;
}

.control-panel,
.result-panel,
.list-panel,
.json-panel {
  padding: 22px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(31, 68, 128, 0.13);
}

.json-panel {
  grid-column: 1 / -1;
}

h2 {
  margin: 0 0 16px;
  color: #304765;
}

.segmented {
  display: flex;
  overflow: hidden;
  border-radius: 6px;
  background: #edf3fb;
}

.segmented button {
  flex: 1;
  min-height: 38px;
  border: 0;
  background: transparent;
  color: #506985;
  text-transform: capitalize;
  cursor: pointer;
}

.segmented button.active {
  background: #5b94ef;
  color: #ffffff;
  font-weight: 800;
}

.score-control {
  display: grid;
  gap: 10px;
  margin-top: 22px;
  color: #506985;
  font-weight: 800;
}

.route-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.shield {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: #3d9b72;
  color: #ffffff;
  font-size: 2rem;
  font-weight: 900;
}

.route-card h3 {
  margin: 0;
  color: #304765;
}

.summary-list {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.summary-list p,
li {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin: 0;
  color: #526780;
}

ol {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-left: 22px;
}

pre {
  max-height: 280px;
  overflow: auto;
  padding: 16px;
  border-radius: 8px;
  background: #1f2d3d;
  color: #d6e7ff;
}

@media (max-width: 820px) {
  .dev-shell {
    padding: 28px 16px;
  }

  .prototype-grid {
    grid-template-columns: 1fr;
  }
}
</style>
