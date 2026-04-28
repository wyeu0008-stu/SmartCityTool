<template>
  <main class="dev-page">
    <DevInsightsPanel />
  </main>
</template>

<script setup>
import DevInsightsPanel from '../components/DevInsightsPanel.vue'
</script>

<style scoped>
.dev-page {
  min-height: calc(100vh - 79px);
  padding: 16px;
  background: #78a9f4;
}

@media (max-width: 820px) {
  .dev-page {
    padding: 10px;
  }
}
</style>
