<script setup>
import { computed, onMounted, ref } from 'vue'

const originRankings = [
  { rank: 1, place: 'Flinders Street Station', trips: 1280, trend: '+18%', score: 98 },
  { rank: 2, place: 'State Library Victoria', trips: 1148, trend: '+12%', score: 94 },
  { rank: 3, place: 'Queen Victoria Market', trips: 1036, trend: '+9%', score: 90 },
  { rank: 4, place: 'Docklands Waterfront', trips: 924, trend: '+7%', score: 86 },
  { rank: 5, place: 'Carlton Gardens', trips: 812, trend: '+5%', score: 82 }
]

const destinationRankings = [
  { rank: 1, place: 'Southbank Promenade', trips: 1324, trend: '+21%', score: 99 },
  { rank: 2, place: 'Melbourne Cricket Ground', trips: 1192, trend: '+14%', score: 95 },
  { rank: 3, place: 'Royal Botanic Gardens', trips: 1076, trend: '+10%', score: 91 },
  { rank: 4, place: 'Harbour Esplanade', trips: 968, trend: '+8%', score: 87 },
  { rank: 5, place: 'Lygon Street Carlton', trips: 846, trend: '+4%', score: 83 }
]

const infrastructureData = [
  { type: 'Basic painted lane', length: 262.36, color: '#2f80ed', width: 100 },
  { type: 'Shared use path (off-road)', length: 236.04, color: '#3f8ae0', width: 90 },
  { type: 'Shared street (sharrows)', length: 171.24, color: '#5ca3d2', width: 65 },
  { type: 'Buffered painted lane', length: 62.59, color: '#70c0a6', width: 24 },
  { type: 'Protected bike lane (on-road)', length: 53.97, color: '#6ac19f', width: 21 },
  { type: 'Intermittent/informal (on-road)', length: 27.18, color: '#68c893', width: 10 },
  { type: 'Shared bike/parking lane', length: 23.28, color: '#6dcc91', width: 9 },
  { type: 'Separated path (off-road)', length: 12.8, color: '#70d094', width: 5 }
]

const parkingData = [
  { type: 'stands', count: 2292, percentage: 77.1, color: '#d65ce8', width: 100 },
  { type: 'Other / Unknown', count: 581, percentage: 19.5, color: '#ff6f69', width: 25 },
  { type: 'rack', count: 41, percentage: 1.4, color: '#0cc084', width: 2 },
  { type: 'post_hoop', count: 35, percentage: 1.2, color: '#a0a500', width: 2 },
  { type: 'shed', count: 24, percentage: 0.8, color: '#12aee8', width: 1 }
]

const areaFilter = ref('Melbourne CBD')
const destinationFilter = ref('All destinations')
const parkingFilter = ref('All parking types')
const selectedDestination = ref(destinationRankings[0].place)
const chartsVisible = ref(false)

const selectedDestinationRecord = computed(() => {
  return destinationRankings.find((item) => item.place === selectedDestination.value) || destinationRankings[0]
})

const filteredParkingData = computed(() => {
  if (parkingFilter.value === 'All parking types') {
    return parkingData
  }

  return parkingData.filter((item) => item.type === parkingFilter.value)
})

const dominantParking = computed(() => filteredParkingData.value[0] || parkingData[0])

const dashboardMetrics = computed(() => [
  { label: 'Selected Destination', value: selectedDestinationRecord.value.place, note: `${selectedDestinationRecord.value.trips.toLocaleString()} trips` },
  { label: 'Total Parking Facilities', value: filteredParkingData.value.reduce((sum, item) => sum + item.count, 0).toLocaleString(), note: `${areaFilter.value} records` },
  { label: 'Largest Infra Type', value: 'Basic painted lane', note: '262.36 km' },
  { label: 'Dominant Parking Type', value: dominantParking.value.type, note: `${dominantParking.value.percentage}%` }
])

const parkingPie = computed(() => {
  const total = filteredParkingData.value.reduce((sum, item) => sum + item.count, 0)

  return `conic-gradient(${filteredParkingData.value
    .map((item, index) => {
      const start = filteredParkingData.value
        .slice(0, index)
        .reduce((sum, slice) => sum + (slice.count / total) * 100, 0)
      const end = start + (item.count / total) * 100

      return `${item.color} ${start}% ${end}%`
    })
    .join(', ')})`
})

function selectDestination(place) {
  selectedDestination.value = place
  destinationFilter.value = place
}

function updateDestinationFilter() {
  selectedDestination.value = destinationFilter.value === 'All destinations'
    ? destinationRankings[0].place
    : destinationFilter.value
}

onMounted(() => {
  window.requestAnimationFrame(() => {
    chartsVisible.value = true
  })
})
</script>

<template>
  <main class="more-info-page" data-test="dev-more-info-panel">
    <section class="leaderboard-shell">
      <div class="page-heading">
        <p class="eyebrow">More Info</p>
        <h1>Popular Ride Rankings</h1>
        <p>
          Demo view for the most requested cycling origins and destinations in Melbourne CBD.
        </p>
      </div>

      <div class="rankings-grid" aria-label="Popular origins and destinations">
        <section class="ranking-panel" aria-labelledby="origin-ranking-title">
          <div class="panel-title">
            <span class="panel-badge">O</span>
            <div>
              <p>Leaderboard</p>
              <h2 id="origin-ranking-title">Popular Origins</h2>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Start Point</th>
                <th scope="col">Trips</th>
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in originRankings" :key="item.place">
                <td>
                  <span class="rank-medal" :class="`rank-${item.rank}`">{{ item.rank }}</span>
                </td>
                <td>
                  <button
                    type="button"
                    class="destination-button has-tooltip"
                    :class="{ active: selectedDestination === item.place }"
                    :data-tooltip="`${item.place}: ${item.trips.toLocaleString()} trips, trend ${item.trend}`"
                    @click="selectDestination(item.place)"
                  >
                    {{ item.place }}
                  </button>
                  <span class="score-track">
                    <span :style="{ width: `${item.score}%` }"></span>
                  </span>
                </td>
                <td>{{ item.trips.toLocaleString() }}</td>
                <td>{{ item.trend }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="ranking-panel" aria-labelledby="destination-ranking-title">
          <div class="panel-title">
            <span class="panel-badge destination">D</span>
            <div>
              <p>Leaderboard</p>
              <h2 id="destination-ranking-title">Popular Destinations</h2>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">End Point</th>
                <th scope="col">Trips</th>
                <th scope="col">Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in destinationRankings" :key="item.place">
                <td>
                  <span class="rank-medal" :class="`rank-${item.rank}`">{{ item.rank }}</span>
                </td>
                <td>
                  <strong>{{ item.place }}</strong>
                  <span class="score-track">
                    <span :style="{ width: `${item.score}%` }"></span>
                  </span>
                </td>
                <td>{{ item.trips.toLocaleString() }}</td>
                <td>{{ item.trend }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <section class="dashboard-space" aria-label="Cycling data dashboard preview">
        <div class="dashboard-heading">
          <div>
            <p class="eyebrow">Cycling Data Dashboard</p>
            <h2>Melbourne CBD cycling infrastructure and bike parking overview</h2>
          </div>
        </div>

        <form class="dashboard-filter-form" aria-label="Dashboard filters">
          <label>
            <span>Area</span>
            <select v-model="areaFilter">
              <option>Melbourne CBD</option>
            </select>
          </label>
          <label>
            <span>Destination</span>
            <select v-model="destinationFilter" @change="updateDestinationFilter">
              <option>All destinations</option>
              <option v-for="item in destinationRankings" :key="item.place">{{ item.place }}</option>
            </select>
          </label>
          <label>
            <span>Parking type</span>
            <select v-model="parkingFilter">
              <option>All parking types</option>
              <option v-for="item in parkingData" :key="item.type">{{ item.type }}</option>
            </select>
          </label>
        </form>

        <section class="chart-card segment-chart" :class="{ 'is-ready': chartsVisible }" aria-labelledby="segment-chart-title">
          <h3 id="segment-chart-title">Total Cycling Segment Length by Infrastructure Type (km)</h3>
          <div class="horizontal-chart">
            <div
              v-for="item in infrastructureData"
              :key="item.type"
              class="bar-row has-tooltip"
              :data-tooltip="`${item.type}: ${item.length} km in ${areaFilter}`"
            >
              <span class="bar-label">{{ item.type }}</span>
              <div class="bar-track">
                <span
                  class="bar-fill"
                  :style="{ width: `${item.width}%`, background: item.color }"
                ></span>
                <strong>{{ item.length }}</strong>
              </div>
            </div>
          </div>
        </section>

        <div class="dashboard-lower">
          <section class="chart-card parking-summary" aria-labelledby="parking-summary-title">
            <h3 id="parking-summary-title">CBD Bike Parking Facilities Summary</h3>
            <div class="parking-summary-layout">
              <div
                class="donut-chart has-tooltip"
                :class="{ 'is-ready': chartsVisible }"
                :style="{ background: parkingPie }"
                :data-tooltip="`${dominantParking.type}: ${dominantParking.count.toLocaleString()} facilities, ${dominantParking.percentage}% share`"
              >
                <span>{{ dominantParking.percentage }}%</span>
              </div>
              <ul class="parking-legend">
                <li
                  v-for="item in filteredParkingData"
                  :key="item.type"
                  class="has-tooltip"
                  :data-tooltip="`${item.type}: ${item.count.toLocaleString()} facilities, ${item.percentage}% share`"
                >
                  <span :style="{ background: item.color }"></span>
                  <strong>{{ item.type }}</strong>
                  <small>{{ item.percentage }}%</small>
                </li>
              </ul>
            </div>
          </section>

          <section class="chart-card parking-bars" :class="{ 'is-ready': chartsVisible }" aria-labelledby="parking-bars-title">
            <h3 id="parking-bars-title">Top Parking Types</h3>
            <div class="vertical-chart">
              <button
                v-for="item in filteredParkingData"
                :key="item.type"
                type="button"
                class="parking-bar has-tooltip"
                :data-tooltip="`${item.type}: ${item.count.toLocaleString()} facilities, ${item.percentage}% of parking records`"
                @click="parkingFilter = item.type"
              >
                <strong>{{ item.count }}</strong>
                <span
                  :style="{ height: `${Math.max(item.width, 8)}%`, background: item.color }"
                ></span>
                <small>{{ item.type }}</small>
              </button>
            </div>
          </section>

          <section class="kpi-grid" aria-label="Dashboard KPI cards">
            <article v-for="metric in dashboardMetrics" :key="metric.label">
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
              <small>{{ metric.note }}</small>
            </article>
          </section>
        </div>
      </section>

    </section>
  </main>
</template>

<style scoped>
.more-info-page {
  min-height: calc(100vh - 79px);
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(232, 238, 247, 0.98)),
    #f5f5f7;
  color: #1d1d1f;
}

.leaderboard-shell {
  position: relative;
  max-width: 1180px;
  min-height: calc(100vh - 116px);
  margin: 0 auto;
  overflow: hidden;
  padding: 58px 28px 34px;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 248, 252, 0.74)),
    url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.14);
}

.leaderboard-shell::after {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 58%;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(247, 249, 252, 0.96));
  pointer-events: none;
}

.page-heading {
  position: relative;
  z-index: 1;
  width: min(100%, 780px);
  margin: 0 auto 30px;
  text-align: center;
}

.eyebrow {
  margin: 0 0 10px;
  color: #0071e3;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.page-heading h1 {
  margin: 0;
  color: #1d1d1f;
  font-size: clamp(2.7rem, 7vw, 5.5rem);
  font-weight: 900;
  line-height: 0.96;
}

.page-heading p:last-child {
  width: min(100%, 620px);
  margin: 18px auto 0;
  color: #6e6e73;
  font-size: 1rem;
  line-height: 1.6;
}

.rankings-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.ranking-panel {
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.11);
  backdrop-filter: blur(22px);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title p,
.panel-title h2 {
  margin: 0;
}

.panel-title p {
  color: #0071e3;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.panel-title h2 {
  color: #1d1d1f;
  font-size: clamp(1.1rem, 2vw, 1.55rem);
}

.panel-badge,
.rank-medal {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  font-weight: 900;
}

.panel-badge {
  width: 46px;
  height: 46px;
  background: #0071e3;
  color: #ffffff;
}

.panel-badge.destination {
  background: #34c759;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

th {
  color: #6e6e73;
  font-size: 0.76rem;
  text-align: left;
  text-transform: uppercase;
}

th,
td {
  padding: 0 10px;
}

tbody tr {
  background: rgba(245, 245, 247, 0.86);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

td {
  height: 58px;
  color: #424245;
  font-weight: 800;
}

td:first-child {
  width: 58px;
  border-radius: 7px 0 0 7px;
}

td:last-child {
  border-radius: 0 7px 7px 0;
  color: #34c759;
}

td strong {
  display: block;
  max-width: 220px;
  overflow: hidden;
  color: #1d1d1f;
  font-size: 0.96rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.destination-button {
  max-width: 220px;
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1d1d1f;
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.destination-button:hover,
.destination-button.active {
  color: #0071e3;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.rank-medal {
  width: 34px;
  height: 34px;
  background: #e5e5ea;
  color: #ffffff;
}

.rank-1 {
  background: #ff9f0a;
  color: #4a2500;
}

.rank-2 {
  background: #c7c7cc;
  color: #26314a;
}

.rank-3 {
  background: #b87333;
  color: #fff0df;
}

.score-track {
  display: block;
  width: min(100%, 180px);
  height: 6px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.12);
}

.score-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0071e3, #34c759);
}

.dashboard-space {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 28px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(22px);
}

.dashboard-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.dashboard-space h2,
.chart-card h3 {
  margin: 0;
  color: #1d1d1f;
}

.dashboard-space h2 {
  max-width: 720px;
  font-size: clamp(1.45rem, 3vw, 2.2rem);
  line-height: 1.08;
}

.dashboard-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.dashboard-filters span {
  min-height: 38px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.1);
  color: #0066cc;
  font-size: 0.86rem;
  font-weight: 800;
}

.dashboard-filter-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.dashboard-filter-form label {
  display: grid;
  gap: 7px;
}

.dashboard-filter-form label span {
  color: #6e6e73;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.dashboard-filter-form select {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(0, 113, 227, 0.16);
  border-radius: 14px;
  background: rgba(245, 245, 247, 0.88);
  color: #1d1d1f;
  cursor: pointer;
  font-weight: 800;
}

.dashboard-filter-form select:focus {
  border-color: #0071e3;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.14);
}

.chart-card {
  border: 1px solid rgba(229, 229, 234, 0.92);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
}

.chart-card h3 {
  font-size: clamp(1.15rem, 2vw, 1.75rem);
  line-height: 1.12;
}

.segment-chart {
  padding: 24px 24px 28px;
}

.horizontal-chart {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.bar-row {
  display: grid;
  grid-template-columns: minmax(160px, 240px) minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.bar-label {
  color: #25324a;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: right;
}

.bar-track {
  position: relative;
  min-height: 28px;
  background:
    linear-gradient(90deg, rgba(203, 213, 225, 0.7) 1px, transparent 1px) 0 0 / 33.333% 100%,
    transparent;
}

.bar-fill {
  display: block;
  height: 26px;
  min-width: 8px;
  border-radius: 0;
  transform: scaleX(0);
  transform-origin: left;
}

.segment-chart.is-ready .bar-fill {
  animation: growHorizontalBar 900ms ease forwards;
}

.bar-track strong {
  position: absolute;
  top: 50%;
  left: min(calc(var(--label-offset, 0px) + 8px), calc(100% - 72px));
  color: #1d1d1f;
  font-size: 0.95rem;
  transform: translateY(-50%);
}

.bar-row:nth-child(1) .bar-track strong {
  left: calc(100% - 62px);
}

.bar-row:nth-child(2) .bar-track strong {
  left: calc(90% + 8px);
}

.bar-row:nth-child(3) .bar-track strong {
  left: calc(65% + 8px);
}

.bar-row:nth-child(4) .bar-track strong {
  left: calc(24% + 8px);
}

.bar-row:nth-child(5) .bar-track strong {
  left: calc(21% + 8px);
}

.bar-row:nth-child(6) .bar-track strong {
  left: calc(10% + 8px);
}

.bar-row:nth-child(7) .bar-track strong {
  left: calc(9% + 8px);
}

.bar-row:nth-child(8) .bar-track strong {
  left: calc(5% + 8px);
}

.dashboard-lower {
  display: grid;
  grid-template-columns: 1fr 0.96fr 1.04fr;
  gap: 18px;
  margin-top: 18px;
}

.parking-summary,
.parking-bars,
.kpi-grid {
  min-height: 360px;
}

.parking-summary,
.parking-bars {
  padding: 22px;
}

.parking-summary-layout {
  display: grid;
  grid-template-columns: minmax(130px, 190px) minmax(0, 1fr);
  gap: 22px;
  align-items: center;
  margin-top: 28px;
}

.donut-chart {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 190px);
  aspect-ratio: 1;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.88);
}

.donut-chart.is-ready {
  animation: revealDonut 680ms ease forwards;
}

.donut-chart::after {
  content: "";
  position: absolute;
  inset: 26%;
  border-radius: 50%;
  background: #ffffff;
}

.donut-chart span {
  position: relative;
  z-index: 1;
  color: #1d1d1f;
  font-size: 1.3rem;
  font-weight: 900;
}

.parking-legend {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.parking-legend li {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  color: #25324a;
  font-size: 0.9rem;
}

.parking-legend li span {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.parking-legend li strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parking-legend li small {
  color: #6e6e73;
  font-weight: 800;
}

.vertical-chart {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
  gap: 12px;
  min-height: 270px;
  margin-top: 22px;
  padding-top: 24px;
  border-bottom: 2px solid rgba(60, 60, 67, 0.12);
  background:
    linear-gradient(rgba(60, 60, 67, 0.08) 1px, transparent 1px) 0 18px / 100% 52px;
}

.parking-bar {
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: end;
  min-width: 0;
  height: 270px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: center;
}

.parking-bar strong {
  align-self: end;
  color: #1d1d1f;
  font-size: 0.95rem;
}

.parking-bar span {
  display: block;
  width: min(100%, 46px);
  min-height: 8px;
  margin: 6px auto 8px;
  border-radius: 4px 4px 0 0;
  transform: scaleY(0);
  transform-origin: bottom;
}

.parking-bars.is-ready .parking-bar span {
  animation: growVerticalBar 820ms ease forwards;
}

.parking-bar:hover span {
  filter: brightness(0.94);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.parking-bar small {
  min-height: 38px;
  overflow: hidden;
  color: #424245;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid rgba(221, 226, 235, 0.95);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  overflow: hidden;
}

.kpi-grid article {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  min-height: 180px;
  padding: 22px;
  border-right: 1px solid rgba(221, 226, 235, 0.95);
  border-bottom: 1px solid rgba(221, 226, 235, 0.95);
}

.kpi-grid article:nth-child(2n) {
  border-right: 0;
}

.kpi-grid article:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.kpi-grid span {
  color: #3f4a60;
  font-size: 0.92rem;
  font-weight: 900;
}

.kpi-grid strong {
  display: block;
  margin-top: 8px;
  overflow-wrap: anywhere;
  color: #0d1b34;
  font-size: clamp(1.65rem, 3vw, 2.65rem);
  line-height: 0.95;
}

.kpi-grid small {
  margin-top: 8px;
  color: #0071e3;
  font-size: 0.95rem;
  font-weight: 800;
}

.has-tooltip {
  position: relative;
}

.has-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 40;
  width: max-content;
  max-width: min(320px, 82vw);
  padding: 9px 11px;
  border-radius: 10px;
  background: rgba(29, 29, 31, 0.92);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.35;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 160ms ease, transform 160ms ease;
  white-space: normal;
}

.has-tooltip:hover::after,
.has-tooltip:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

@keyframes growHorizontalBar {
  to {
    transform: scaleX(1);
  }
}

@keyframes growVerticalBar {
  to {
    transform: scaleY(1);
  }
}

@keyframes revealDonut {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 940px) {
  .rankings-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-filters {
    justify-content: flex-start;
  }

  .dashboard-filter-form {
    grid-template-columns: 1fr;
  }

  .dashboard-lower {
    grid-template-columns: 1fr;
  }

  .parking-summary,
  .parking-bars,
  .kpi-grid {
    min-height: 0;
  }

}

@media (max-width: 640px) {
  .more-info-page {
    padding: 0;
  }

  .leaderboard-shell {
    min-height: calc(100vh - 96px);
    padding: 30px 12px 20px;
    border-radius: 0 0 28px 28px;
  }

  .ranking-panel,
  .dashboard-space {
    padding: 14px;
  }

  th:nth-child(4),
  td:nth-child(4) {
    display: none;
  }

  td strong {
    max-width: 170px;
  }

  .metric-strip {
    grid-template-columns: 1fr;
  }

  .segment-chart,
  .parking-summary,
  .parking-bars {
    padding: 16px;
  }

  .bar-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .bar-label {
    text-align: left;
  }

  .bar-track strong {
    position: static;
    display: block;
    margin-top: 4px;
    transform: none;
  }

  .parking-summary-layout {
    grid-template-columns: 1fr;
  }

  .donut-chart {
    max-width: 220px;
    margin: 0 auto;
  }

  .vertical-chart {
    gap: 8px;
    overflow-x: auto;
  }

  .parking-bar {
    min-width: 72px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid article,
  .kpi-grid article:nth-child(2n),
  .kpi-grid article:nth-last-child(-n + 2) {
    border-right: 0;
    border-bottom: 1px solid rgba(221, 226, 235, 0.95);
  }

  .kpi-grid article:last-child {
    border-bottom: 0;
  }
}
</style>
