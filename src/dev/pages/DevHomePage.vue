<template>
  <main class="dev-page">
    <DevPlannerHomeSection />
  </main>
</template>

<script setup>
import DevPlannerHomeSection from '../components/DevPlannerHomeSection.vue'
</script>

<style scoped>
.dev-page {
  min-height: calc(100vh - 79px);
  padding: 16px;
  background: #78a9f4;
}

@media (max-width: 640px) {
  .dev-page {
    padding: 10px;
  }
}
</style>
