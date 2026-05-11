<script setup>
import { computed } from 'vue'
import { devInsightCards } from '../services/devPlannerContentService'

const today = computed(() => new Date().toLocaleDateString('en-AU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}))

const cyclingTips = [
  {
    title: 'Start Small',
    text: 'Even a short ride through Melbourne CBD can help build confidence and improve daily fitness.'
  },
  {
    title: 'Choose Bike Lanes',
    text: 'Use marked bike lanes where possible to make your journey safer and more comfortable.'
  },
  {
    title: 'Avoid Peak Stress',
    text: 'Try riding during quieter hours to enjoy a smoother and less stressful trip.'
  },
  {
    title: 'Plan Before You Ride',
    text: 'Check your route before leaving, especially around busy intersections and tram corridors.'
  },
  {
    title: 'Every Ride Counts',
    text: 'Each cycling trip helps reduce congestion and supports a cleaner Melbourne CBD.'
  },
  {
    title: 'Ride with Confidence',
    text: 'Safe cycling is not about speed. It is about awareness, control, and good route choices.'
  },
  {
    title: 'Use Visibility',
    text: 'Wear visible clothing and use lights when riding in low-light conditions.'
  },
  {
    title: 'Take Breaks',
    text: 'If the weather feels uncomfortable, pause your trip and continue when conditions improve.'
  },
  {
    title: 'Enjoy the City',
    text: 'Cycling can turn a normal commute into a more active and enjoyable city experience.'
  },
  {
    title: 'Be Predictable',
    text: 'Signal early, keep a steady line, and make your movements clear to other road users.'
  }
]

const randomTips = computed(() => {
  return [...cyclingTips]
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

    <section class="tips-section">
      <div class="tips-heading">
        <p class="eyebrow">Positive Cycling Tips</p>
        <h2>Small choices can make every ride safer</h2>
      </div>

      <div class="tips-grid">
        <article
          v-for="tip in randomTips"
          :key="tip.title"
          class="tip-card"
        >
          <div class="tip-icon">🚴</div>
          <h3>{{ tip.title }}</h3>
          <p>{{ tip.text }}</p>
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
@media (max-width: 820px) { .insights-shell { padding: 28px 14px; } .insight-grid { grid-template-columns: 1fr; } article { min-height: 0; } }
.tips-section {
  margin-top: 34px;
  padding: 28px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 36px rgba(31, 68, 128, 0.14);
}

.tips-heading {
  margin-bottom: 20px;
}

.tips-heading h2 {
  margin: 0;
  color: #24406f;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.tip-card {
  min-height: 180px;
  padding: 22px;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(239, 247, 255, 0.92));
  box-shadow: 0 10px 26px rgba(31, 68, 128, 0.12);
}

.tip-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  border-radius: 14px;
  background: #e6f4ee;
  font-size: 1.4rem;
}

.tip-card h3 {
  margin: 0 0 10px;
  color: #24406f;
  font-size: 1.2rem;
}

.tip-card p {
  margin: 0;
  color: #526780;
  line-height: 1.55;
}

@media (max-width: 820px) {
  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
