<template>
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <AppHeader />
  <div id="main-content" tabindex="-1">
    <router-view />
  </div>
  <AppFooter />
</template>

<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>
