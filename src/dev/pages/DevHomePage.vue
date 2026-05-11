<script setup>
/* c8 ignore file */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const destination = ref('')
const showDestinationSuggestions = ref(false)
const searchForm = ref(null)

const destinationSuggestions = [
  'Flinders Street Station',
  'State Library Victoria',
  'Melbourne Cricket Ground',
  'Docklands',
  'Carlton Gardens',
  'Flagstaff Station',
  'Queen Victoria Market',
  'Southbank'
]

const filteredDestinationSuggestions = computed(() => {
  const query = destination.value.trim().toLowerCase()

  if (!query) {
    return destinationSuggestions.slice(0, 6)
  }

  return destinationSuggestions
    .filter((item) => item.toLowerCase().includes(query))
    .slice(0, 6)
})

function closeSuggestionsOnOutsideClick(event) {
  if (!searchForm.value?.contains(event.target)) {
    showDestinationSuggestions.value = false
  }
}

const tourismRoutes = [
  { id: 'yarra', name: 'Yarra River Ride', area: 'Southbank to Abbotsford', destination: 'Abbotsford Convent', time: '42 mins', distance: '11.2 km', vibe: 'River views', color: '#34c759' },
  { id: 'gardens', name: 'Gardens Loop', area: 'Botanic Gardens and Shrine', destination: 'Royal Botanic Gardens Melbourne', time: '28 mins', distance: '7.4 km', vibe: 'Scenic calm', color: '#007aff' },
  { id: 'docklands', name: 'Docklands Waterfront', area: 'CBD to Harbour Esplanade', destination: 'Harbour Esplanade Docklands', time: '24 mins', distance: '6.1 km', vibe: 'Waterfront', color: '#ff9f0a' },
  { id: 'carlton', name: 'Carlton Culture Trail', area: 'State Library to Lygon Street', destination: 'Lygon Street Carlton', time: '22 mins', distance: '5.6 km', vibe: 'Food stops', color: '#af52de' },
  { id: 'arts', name: 'Arts Precinct Spin', area: 'Fed Square to NGV', destination: 'National Gallery of Victoria', time: '18 mins', distance: '4.2 km', vibe: 'Landmarks', color: '#ff375f' },
  { id: 'parkville', name: 'Parkville Green Link', area: 'University to Royal Park edge', destination: 'Royal Park Melbourne', time: '35 mins', distance: '9.5 km', vibe: 'Green route', color: '#30b0c7' }
]

const featuredTourismRoutes = computed(() => {
  return [...tourismRoutes]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
})

function selectDestinationSuggestion(suggestion) {
  destination.value = suggestion
  showDestinationSuggestions.value = false
}

function openMap(target = '') {
  const requestedDestination = typeof target === 'string'
    ? target
    : destination.value
  const targetDestination = requestedDestination.trim()
  const mapPath = route.path.startsWith('/dev') ? '/dev/map' : '/map'

  showDestinationSuggestions.value = false

  if (!targetDestination) {
    router.push(mapPath)
    return
  }

  router.push({
    path: mapPath,
    query: {
      from: 'current-location',
      destination: targetDestination,
      showRoute: 'true'
    }
  })
}

onMounted(() => {
  document.addEventListener('click', closeSuggestionsOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSuggestionsOnOutsideClick)
})
</script>

<template>
  <main class="release-home" data-test="dev-home-panel">
    <section class="hero-panel">
      <div class="hero-copy">
        <h1>KnackCBD Ride</h1>
        <p>A Smart Cycling Safety and Decision Support System</p>
        <p>Using Open Mobility Data</p>
      </div>

      <form
        ref="searchForm"
        class="route-search"
        :class="{ 'has-suggestions': showDestinationSuggestions && filteredDestinationSuggestions.length }"
        @submit.prevent="openMap"
      >
        <div class="home-search-box">
          <label class="field">
            <span class="pin-icon hollow">🔍</span>
            <input
              v-model="destination"
              placeholder="Enter Destination"
              @focus="showDestinationSuggestions = true"
              @click="showDestinationSuggestions = true"
            />
          </label>

          <div v-if="showDestinationSuggestions && filteredDestinationSuggestions.length" class="home-suggestion-list">
            <button
              v-for="suggestion in filteredDestinationSuggestions"
              :key="suggestion"
              type="button"
              class="home-suggestion-option"
              @click="selectDestinationSuggestion(suggestion)"
            >
              <span class="history-icon">↻</span>
              <span>{{ suggestion }}</span>
            </button>
          </div>
        </div>

        <button class="find-button" type="submit">Find Safest Route</button>
      </form>

      <section class="safety-analysis-card" aria-label="How safety is analysed">
        <div class="analysis-header">
          <div class="analysis-icon">S</div>
          <div>
            <h2>How KnackCBD Ride Analyses Safety</h2>
            <p>
              Each route is checked using road safety, crash history, traffic exposure, and cycling infrastructure.
            </p>
          </div>
        </div>

        <div class="analysis-steps">
          <div class="analysis-step">
            <span>1</span>
            <p>The route is divided into road sections for safety checking.</p>
          </div>
          <div class="analysis-step">
            <span>2</span>
            <p>Each section is reviewed for possible cycling risk.</p>
          </div>
          <div class="analysis-step">
            <span>3</span>
            <p>The final safety score combines route risk and bike-lane coverage.</p>
          </div>
        </div>

        <div class="analysis-actions">
          <button type="button" @click="openMap">Open Safety Map</button>
          <span class="analysis-badge">AI</span>
          <span>Safety score support</span>
        </div>
      </section>
      <section class="compare-section" aria-label="Popular cycling tourism routes">
        <h2>Popular Cycling Trips</h2>
        <div class="compare-grid">
          <article v-for="route in featuredTourismRoutes" :key="route.id" class="compare-card">
            <h3>{{ route.name }} <span>{{ route.area }}</span></h3>
            <div class="metric-row">
              <strong :style="{ background: route.color }">{{ route.vibe }}</strong>
              <span>{{ route.time }}</span>
              <small>{{ route.distance }}</small>
            </div>
            <button type="button" :style="{ background: route.color }" @click="openMap(route.destination)">Plan This Ride</button>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.release-home {
  min-height: calc(100vh - 79px);
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(232, 238, 247, 0.98)),
    #f5f5f7;
  color: #1d1d1f;
}

.hero-panel {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  min-height: calc(100vh - 116px);
  padding: 54px 28px 30px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 248, 252, 0.72)),
    url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.14);
}

.hero-panel::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 56%;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(247, 249, 252, 0.96));
  pointer-events: none;
}

.hero-copy,
.route-search,
.compare-section {
  position: relative;
  z-index: 1;
  width: min(100%, 1040px);
  margin-inline: auto;
}

.hero-copy {
  text-align: center;
  color: #1d1d1f;
}

.hero-copy h1 {
  margin: 0 0 10px;
  font-size: clamp(2.5rem, 7vw, 5.7rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.96;
}

.hero-copy p {
  max-width: 560px;
  margin: 8px auto 0;
  color: #5f6368;
  font-size: clamp(1.04rem, 2vw, 1.28rem);
  line-height: 1.4;
}

.route-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  max-width: 680px;
  margin-top: 38px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(22px);
}

.route-search.has-suggestions {
  margin-bottom: 298px;
}

.home-search-box {
  position: relative;
  min-width: 0;
}

.home-suggestion-list {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  left: 0;
  z-index: 30;
  max-height: 286px;
  overflow-y: auto;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(18px);
}

.home-suggestion-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 46px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: #424245;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
}

.home-suggestion-option:hover {
  background: rgba(0, 113, 227, 0.08);
}

.history-icon {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: rgba(60, 60, 67, 0.1);
  color: #6e6e73;
  font-size: 0.8rem;
  font-weight: 900;
}

.field {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: center;
  min-height: 48px;
  padding: 0 12px;
  border-radius: 16px;
  background: rgba(245, 245, 247, 0.82);
}


.pin-icon {
  color: #0071e3;
  font-size: 0;
}

.pin-icon::before {
  content: "";
  display: block;
  width: 9px;
  height: 9px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.field input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #1d1d1f;
  font-size: 1rem;
}

.field input:focus {
  outline: none;
}


.find-button,
.compare-button,
.compare-card button,
.route-stats button {
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 800;
}

.find-button {
  min-height: 48px;
  padding: 0 22px;
  background: #0071e3;
  font-size: 1rem;
}

.safety-analysis-card {
  position: relative;
  z-index: 1;
  width: min(100%, 1040px);
  margin: 34px auto 0;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(20px);
}

.analysis-header {
  display: flex;
  gap: 18px;
  align-items: center;
}

.analysis-icon,
.analysis-badge {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 18px;
  background: #34c759;
  color: #ffffff;
  font-weight: 900;
}

.analysis-icon {
  width: 62px;
  height: 62px;
  font-size: 2rem;
}

.analysis-header h2 {
  margin: 0;
  color: #1d1d1f;
  font-size: 1.4rem;
}

.analysis-header p {
  margin: 8px 0 0;
  color: #6e6e73;
  font-size: 1rem;
  line-height: 1.45;
}

.analysis-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.analysis-step {
  display: flex;
  gap: 12px;
  min-height: 112px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(245, 245, 247, 0.78);
  text-align: left;
}

.analysis-step span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #ff9f0a;
  color: #ffffff;
  font-weight: 900;
}

.analysis-step:nth-child(3) span {
  background: #ff375f;
}

.analysis-step p {
  margin: 0;
  color: #424245;
  font-size: 1rem;
  line-height: 1.45;
}

.analysis-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  align-items: center;
  margin-top: 22px;
  color: #424245;
  font-weight: 700;
}

.analysis-actions button {
  min-height: 42px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.12);
  color: #0066cc;
  cursor: pointer;
  font-weight: 900;
}

.analysis-badge {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  font-size: 1rem;
}

.compare-section {
  margin-top: 32px;
  text-align: center;
}

.compare-section h2 {
  margin: 0;
  color: #1d1d1f;
  font-size: 1.15rem;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.compare-card {
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.78);
  text-align: left;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(18px);
}

.compare-card h3 {
  margin: 0 0 14px;
  color: #1d1d1f;
  font-size: 1rem;
}

.compare-card h3 span {
  display: block;
  margin-top: 5px;
  color: #6e6e73;
  font-size: 0.88rem;
  font-weight: 600;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #424245;
}

.metric-row strong {
  padding: 8px 12px;
  border-radius: 999px;
  color: #ffffff;
}

.metric-row small {
  margin-left: auto;
}

.compare-card button {
  width: 100%;
  min-height: 42px;
  margin-top: 16px;
}

.compare-button {
  margin-top: 16px;
  padding: 11px 22px;
  background: #1d1d1f;
}

@media (max-width: 900px) {
  .compare-grid,
  .analysis-steps {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .release-home {
    padding: 0;
  }

  .hero-panel {
    min-height: calc(100vh - 96px);
    padding: 34px 14px 18px;
    border-radius: 0 0 28px 28px;
  }

  .hero-copy {
    text-align: center;
  }

  .hero-copy h1 {
    font-size: 3rem;
  }

  .hero-copy p {
    font-size: 0.98rem;
  }

  .route-search,
  .compare-card {
    padding: 14px;
  }

  .route-search {
    grid-template-columns: 1fr;
    border-radius: 20px;
  }

  .route-search.has-suggestions {
    margin-bottom: 0;
  }

  .safety-analysis-card {
    margin-top: 20px;
    padding: 18px;
    border-radius: 24px;
  }

  .analysis-header {
    align-items: flex-start;
  }

  .analysis-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    font-size: 1.5rem;
  }

  .analysis-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .home-suggestion-list {
    position: static;
    margin-top: 8px;
  }

  .field {
    min-height: 44px;
    padding: 0 12px;
  }

  .metric-row {
    align-items: flex-start;
  }

  .metric-row small {
    margin-left: 0;
  }

  .compare-button,
  .find-button {
    width: 100%;
  }
}
</style>
