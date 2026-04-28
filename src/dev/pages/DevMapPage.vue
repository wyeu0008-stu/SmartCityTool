<template>
  <main class="dev-page">
    <DevPlannerMapPanel />
  </main>
</template>

<script setup>
import DevPlannerMapPanel from '../components/DevPlannerMapPanel.vue'
</script>

<style scoped>
.dev-page {
  min-height: calc(100vh - 79px);
  padding: 16px;
  background: #78a9f4;
}

@media (max-width: 980px) {
  .dev-page {
    padding: 12px;
  }
}

@media (max-width: 640px) {
  .dev-page {
    padding: 10px;
  }
}
</style>
