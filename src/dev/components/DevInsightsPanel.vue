<script setup>
import { computed } from 'vue'
import { devInsightCards } from '../services/devPlannerContentService'

const today = computed(() => new Date().toLocaleDateString('en-AU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}))

const cyclingBenefits = [
  {
    icon: '❤️',
    title: 'Boost Physical Health',
    text: 'Cycling helps improve cardiovascular fitness, strengthen leg muscles, and support daily calorie burning.'
  },
  {
    icon: '🌱',
    title: 'Reduce Carbon Emissions',
    text: 'Choosing a bike for short trips helps reduce traffic pollution and supports a cleaner urban environment.'
  },
  {
    icon: '💰',
    title: 'Save Daily Travel Costs',
    text: 'Cycling can reduce spending on fuel, parking, and short-distance public transport.'
  },
  {
    icon: '🧠',
    title: 'Improve Mental Wellbeing',
    text: 'A short ride can help reduce stress, refresh your mind, and make commuting feel more positive.'
  },
  {
    icon: '🚦',
    title: 'Avoid Traffic Congestion',
    text: 'For many short city trips, cycling can be more predictable than driving during busy traffic periods.'
  },
  {
    icon: '🏙️',
    title: 'Support a Liveable City',
    text: 'More cycling means less road pressure, quieter streets, and more people-friendly public spaces.'
  }
]

const randomBenefits = computed(() => {
  return [...cyclingBenefits]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
})
</script>

<template>
  <section class="insights-shell">
    <p class="eyebrow">Safety Insights</p>
    <h1>Daily Cycling Conditions</h1>
    <p class="date-text">{{ today }}</p>

    <div class="insight-grid">
      <article v-for="card in devInsightCards" :key="card.title">
        <span>{{ card.title }}</span>
        <strong>{{ card.value }}</strong>
        <p>{{ card.detail }}</p>
      </article>
    </div>
    <section class="benefits-panel">
  <div class="benefits-header">
    <div>
      <p class="benefits-eyebrow">Positive Cycling Motivation</p>
      <h2>Why Choose Cycling Today?</h2>
    </div>
    <span class="benefits-badge">Random Tips</span>
  </div>

  <div class="benefits-grid">
    <article
      v-for="benefit in randomBenefits"
      :key="benefit.title"
      class="benefit-card"
    >
      <div class="benefit-icon">{{ benefit.icon }}</div>
      <h3>{{ benefit.title }}</h3>
      <p>{{ benefit.text }}</p>
    </article>
  </div>
</section>
  </section>
</template>

<style scoped>
.insights-shell { max-width: 1180px; min-height: 640px; margin: 0 auto; padding: 40px 24px; border: 1px solid rgba(255, 255, 255, 0.45); background: linear-gradient(rgba(235, 244, 255, 0.82), rgba(235, 244, 255, 0.74)), url('/tomi-vadasz-SBKJ47obEHY-unsplash.jpg') center / cover; box-shadow: 0 22px 58px rgba(31, 68, 128, 0.24); }
.eyebrow { margin: 0 0 10px; color: #2f6f4f; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
h1 { margin: 0; color: #24406f; font-size: clamp(2.3rem, 5vw, 4rem); line-height: 1.08; }
.date-text { color: #526780; font-size: 1.05rem; }
.insight-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 34px; }
article { min-height: 190px; padding: 24px; border-radius: 8px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 12px 30px rgba(31, 68, 128, 0.13); }
article span { color: #526780; font-weight: 800; }
article strong { display: block; margin-top: 16px; color: #2f855f; font-size: 2rem; }
article p { color: #526780; line-height: 1.6; }
.benefits-panel {
  margin-top: 34px;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(238, 247, 255, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 18px 40px rgba(31, 68, 128, 0.16);
  backdrop-filter: blur(10px);
}

.benefits-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 22px;
}

.benefits-eyebrow {
  margin: 0 0 6px;
  color: #2f855f;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.benefits-header h2 {
  margin: 0;
  color: #24406f;
  font-size: 1.6rem;
}

.benefits-badge {
  padding: 8px 14px;
  border-radius: 999px;
  background: #eaf7ee;
  color: #2f855f;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.benefit-card {
  min-height: 190px;
  padding: 22px;
  border-radius: 18px;
  background: white;
  border: 1px solid #e4ebf3;
  box-shadow: 0 10px 24px rgba(31, 68, 128, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(31, 68, 128, 0.18);
}

.benefit-icon {
  width: 46px;
  height: 46px;
  margin-bottom: 14px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #f0f7ff;
  font-size: 1.5rem;
}

.benefit-card h3 {
  margin: 0 0 10px;
  color: #24406f;
  font-size: 1.05rem;
}

.benefit-card p {
  margin: 0;
  color: #526780;
  line-height: 1.6;
  font-size: 0.95rem;
}
@media (max-width: 820px) {
  .insights-shell {
    padding: 28px 14px;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }

  article {
    min-height: 0;
  }

  .benefits-header {
    flex-direction: column;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 820px) { .insights-shell { padding: 28px 14px; } .insight-grid { grid-template-columns: 1fr; } article { min-height: 0; } }
</style>
