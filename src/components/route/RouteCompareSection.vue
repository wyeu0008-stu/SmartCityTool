<template>
  <section class="compare-section">
    <h3>Compare Routes</h3>

    <div class="route-grid">
      <RouteOptionCard
        v-for="route in routes"
        :key="route.id"
        :route="route"
        :active="route.id === selectedRouteId"
        @view="$emit('view-route', route)"
      />
    </div>

    <BaseButton variant="secondary" @click="$emit('compare-all')">
      Compare All Routes
    </BaseButton>
  </section>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'
import RouteOptionCard from './RouteOptionCard.vue'

defineProps({
  routes: {
    type: Array,
    default: () => []
  },
  selectedRouteId: {
    type: Number,
    default: null
  }
})

defineEmits(['view-route', 'compare-all'])
</script>

<style scoped>
.compare-section {
  text-align: center;
}

.compare-section h3 {
  margin: 0 0 18px;
  color: #3e5e92;
  font-size: 1.3rem;
}

.route-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

@media (max-width: 900px) {
  .route-grid {
    grid-template-columns: 1fr;
  }
}
</style>