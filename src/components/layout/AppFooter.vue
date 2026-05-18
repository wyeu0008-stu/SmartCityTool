<template>
  <footer class="app-footer">
    <div>
      <p>Website Map</p>
      <h2>Explore the function pages</h2>
    </div>

    <nav class="footer-links" aria-label="Website map">
      <router-link :to="navBase.home">Home</router-link>
      <router-link :to="navBase.map">Map</router-link>
      <router-link :to="navBase.insights">Safety Insights</router-link>
      <router-link v-if="navBase.moreInfo" :to="navBase.moreInfo">More Info</router-link>
    </nav>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navBase = computed(() => {
  if (route.path.startsWith('/dev')) {
    return {
      home: '/dev',
      map: '/dev/map',
      insights: '/dev/insights',
      moreInfo: '/dev/more-info'
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
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding: 22px 24px;
  border-top: 1px solid rgba(203, 213, 225, 0.74);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 248, 252, 0.96)),
    #f5f5f7;
  box-shadow: 0 -14px 36px rgba(15, 23, 42, 0.06);
}

.app-footer p,
.app-footer h2 {
  margin: 0;
}

.app-footer p {
  color: #0071e3;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.app-footer h2 {
  margin-top: 6px;
  color: #1d1d1f;
  font-size: clamp(1.12rem, 2vw, 1.45rem);
  line-height: 1.1;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-links a {
  min-height: 42px;
  padding: 11px 15px;
  border-radius: 999px;
  background: rgba(0, 113, 227, 0.1);
  color: #0066cc;
  font-weight: 900;
  text-decoration: none;
}

.footer-links a:hover,
.footer-links a.router-link-active {
  background: #0071e3;
  color: #ffffff;
}

@media (max-width: 760px) {
  .app-footer {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px 16px;
  }

  .footer-links {
    justify-content: flex-start;
  }
}
</style>
