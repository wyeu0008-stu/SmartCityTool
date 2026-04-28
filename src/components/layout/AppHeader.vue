<template>
  <header class="app-header">
    <div class="brand">
      <img :src="logoSrc" alt="logo" class="logo" />
      <span class="brand-text">SmartCycle Navigator</span>
    </div>

    <nav class="nav-links" aria-label="Primary">
      <router-link :to="navBase.home" active-class="active">Home</router-link>
      <router-link :to="navBase.map" active-class="active">Map</router-link>
      <router-link :to="navBase.insights" active-class="active">Safety Insights</router-link>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const logoSrc = '/cycling.png'
const route = useRoute()

const navBase = computed(() => {
  if (route.path.startsWith('/dev')) {
    return {
      home: '/dev',
      map: '/dev/map',
      insights: '/dev/insights'
    }
  }

  return {
    home: '/',
    map: '/map',
    insights: '/insights'
  }
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding: 16px 24px;
  background: linear-gradient(90deg, #2c66bc, #3f7ed5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.26);
  box-shadow: 0 10px 24px rgba(31, 68, 128, 0.18);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-text {
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.nav-links a {
  padding: 8px 12px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.96rem;
  text-decoration: none;
  white-space: nowrap;
}

.nav-links a.active {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-weight: 700;
}

.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

@media (max-width: 900px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 14px 16px;
  }

  .brand {
    justify-content: center;
  }

  .brand-text {
    font-size: 1rem;
  }

  .nav-links {
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .nav-links::-webkit-scrollbar {
    display: none;
  }
}
</style>
