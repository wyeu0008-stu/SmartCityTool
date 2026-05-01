<script setup>
import { computed } from 'vue'

const insightCards = [
  {
    title: 'Weather Fit',
    value: 'Good',
    detail: 'Light wind and clear visibility for city cycling.'
  },
  {
    title: 'Traffic Risk',
    value: 'Medium',
    detail: 'Several busier junctions need route-aware warnings.'
  },
  {
    title: 'Safer Window',
    value: '10:00-14:00',
    detail: 'Lower congestion and steadier cycling conditions.'
  }
]

const today = computed(() => new Date().toLocaleDateString('en-AU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}))
</script>

<template>
  <main class="release-insights">
    <section class="insights-shell">
      <p class="eyebrow">Safety Insights</p>
      <h1>Daily Cycling Conditions</h1>
      <p class="date-text">{{ today }}</p>

      <div class="insight-grid">
        <article v-for="card in insightCards" :key="card.title">
          <span>{{ card.title }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.detail }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.release-insights {
  min-height: calc(100vh - 79px);
  padding: 16px;
  background: #78a9f4;
}

.insights-shell {
  max-width: 1180px;
  min-height: 640px;
  margin: 0 auto;
  padding: 40px 24px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background:
    linear-gradient(rgba(235, 244, 255, 0.82), rgba(235, 244, 255, 0.74)),
    url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover;
  box-shadow: 0 22px 58px rgba(31, 68, 128, 0.24);
}

.eyebrow {
  margin: 0 0 10px;
  color: #2f6f4f;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #24406f;
  font-size: clamp(2.3rem, 5vw, 4rem);
  line-height: 1.08;
}

.date-text {
  color: #526780;
  font-size: 1.05rem;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 34px;
}

article {
  min-height: 190px;
  padding: 24px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(31, 68, 128, 0.13);
}

article span {
  color: #526780;
  font-weight: 800;
}

article strong {
  display: block;
  margin-top: 16px;
  color: #2f855f;
  font-size: 2rem;
}

article p {
  color: #526780;
  line-height: 1.6;
}

@media (max-width: 820px) {
  .release-insights {
    padding: 10px;
  }

  .insights-shell {
    padding: 28px 14px;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }

  article {
    min-height: 0;
  }
}
</style>
