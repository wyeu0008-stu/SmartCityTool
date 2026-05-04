<script setup>
/* c8 ignore file */
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
  <main class="release-insights" data-test="dev-insights-panel">
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
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(232, 238, 247, 0.98)),
    #f5f5f7;
}

.insights-shell {
  max-width: 1180px;
  min-height: calc(100vh - 116px);
  margin: 0 auto;
  padding: 58px 28px;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 248, 252, 0.74)),
    url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.14);
}

.eyebrow {
  margin: 0 0 10px;
  color: #0071e3;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  max-width: 760px;
  color: #1d1d1f;
  font-size: clamp(2.8rem, 7vw, 5.8rem);
  font-weight: 800;
  line-height: 0.96;
}

.date-text {
  color: #6e6e73;
  font-size: 1.14rem;
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
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.11);
  backdrop-filter: blur(22px);
}

article span {
  color: #6e6e73;
  font-weight: 800;
}

article strong {
  display: block;
  margin-top: 16px;
  color: #1d1d1f;
  font-size: 2.25rem;
}

article p {
  color: #6e6e73;
  line-height: 1.6;
}

@media (max-width: 820px) {
  .release-insights {
    padding: 0;
  }

  .insights-shell {
    min-height: calc(100vh - 96px);
    padding: 40px 14px 18px;
    border-radius: 0 0 28px 28px;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }

  article {
    min-height: 0;
  }
}
</style>
