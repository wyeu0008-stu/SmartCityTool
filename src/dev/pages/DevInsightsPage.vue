<script setup>
/* c8 ignore file */
import { computed, ref } from 'vue'

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
  },
  {
    title: 'Stay Hydrated',
    text: 'Bring water for longer city rides, especially during warm afternoons.'
  },
  {
    title: 'Check Your Bike',
    text: 'A quick tyre and brake check before leaving can make your ride safer.'
  }
]

const tipSeed = ref(0)

const today = computed(() => new Date().toLocaleDateString('en-AU', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}))

const randomTips = computed(() => {
  tipSeed.value

  return [...cyclingTips]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
})

function refreshTips() {
  tipSeed.value += 1
}
</script>

<template>
  <main class="release-insights" data-test="dev-insights-panel">
    <section class="insights-shell">
      <p class="eyebrow">Safety Insights</p>
      <h1>Daily Cycling Conditions</h1>
      <p class="date-text">{{ today }}</p>

      <div class="insight-grid">
        <article v-for="card in insightCards" :key="card.title" class="condition-card">
          <span>{{ card.title }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.detail }}</p>
        </article>
      </div>

      <section class="tips-section">
        <div class="tips-heading">
          <div>
            <p class="eyebrow">Positive Cycling Tips</p>
            <h2>Small choices can make every ride safer</h2>
          </div>

          <button class="refresh-button" type="button" @click="refreshTips">
            Refresh Tips
          </button>
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

.condition-card {
  min-height: 190px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.11);
  backdrop-filter: blur(22px);
}

.condition-card span {
  color: #6e6e73;
  font-weight: 800;
}

.condition-card strong {
  display: block;
  margin-top: 16px;
  color: #1d1d1f;
  font-size: 2.25rem;
}

.condition-card p {
  color: #6e6e73;
  line-height: 1.6;
}

.tips-section {
  margin-top: 34px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(22px);
}

.tips-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.tips-heading h2 {
  margin: 0;
  max-width: 680px;
  color: #1d1d1f;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  line-height: 1.1;
}

.refresh-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  color: #ffffff;
  background: #0071e3;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(0, 113, 227, 0.24);
}

.refresh-button:hover {
  background: #005bbd;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.tip-card {
  min-height: 190px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(235, 247, 255, 0.9));
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.1);
}

.tip-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
  border-radius: 16px;
  background: #e8f5ee;
  font-size: 1.35rem;
}

.tip-card h3 {
  margin: 0 0 10px;
  color: #1d1d1f;
  font-size: 1.25rem;
}

.tip-card p {
  margin: 0;
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

  .insight-grid,
  .tips-grid {
    grid-template-columns: 1fr;
  }

  .condition-card,
  .tip-card {
    min-height: 0;
  }

  .tips-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
