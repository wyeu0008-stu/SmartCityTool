<template>
  <article class="route-card glass-card" :class="{ active: active }">
    <div class="route-header">
      <span class="mini-icon" :class="route.badgeClass">🛡️</span>
      <span class="route-title">{{ route.name }}</span>
    </div>

    <div class="route-body">
      <div class="score-box" :class="route.scoreClass">
        {{ route.score }}
      </div>

      <div class="route-meta">
        <span>{{ route.time }}</span>
        <span class="risk-text" :class="route.riskClass">● {{ route.risk }}</span>
      </div>
    </div>

    <BaseButton variant="secondary" class="full-width" @click="$emit('view')">
      View Route
    </BaseButton>
  </article>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

defineProps({
  route: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view'])
</script>

<style scoped>
.route-card {
  border-radius: 16px;
  padding: 16px;
  text-align: left;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.route-card.active {
  border-color: rgba(74, 124, 216, 0.45);
  box-shadow: 0 14px 34px rgba(76, 120, 196, 0.24);
}

.route-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #496990;
  font-weight: 700;
}

.mini-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.8rem;
}

.green-badge {
  background: #dcf5e6;
}

.yellow-badge {
  background: #fff2cb;
}

.route-body {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
}

.score-box {
  min-width: 64px;
  text-align: center;
  padding: 9px 12px;
  border-radius: 10px;
  color: white;
  font-size: 1.1rem;
  font-weight: 800;
}

.score-box.green {
  background: linear-gradient(180deg, #56b98a, #399f70);
}

.score-box.blue {
  background: linear-gradient(180deg, #6295f2, #4c7dd8);
}

.score-box.teal {
  background: linear-gradient(180deg, #57b8c7, #429aa7);
}

.route-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  color: #6480a5;
  font-size: 0.9rem;
}

.risk-text.low {
  color: #50ad63;
}

.risk-text.medium {
  color: #dea32e;
}

.risk-text.high {
  color: #e06b6b;
}

.full-width {
  width: 100%;
}
</style>