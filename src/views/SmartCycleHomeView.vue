<template>
  <div class="page-container">

    <div class="page-shell">
      <AppHeader />

      <!-- HERO SECTION (new layout) -->
      <section class="hero">
        <div class="hero-left">
          <p class="hero-tag">SMART CYCLING SAFETY SYSTEM</p>
          <h1>
            Cycle with <span>Safety</span>
          </h1>
          <p>
            A smart cycling safety and decision support system using open mobility data.
          </p>

          <div class="hero-buttons">
            <button class="btn-primary">Check Map</button>
            <button class="btn-secondary">Plan My Route</button>
          </div>
        </div>

        <div class="hero-right">
          <img src="/public/tomi-vadasz-SBKJ47obEHY-unsplash.jpg" alt="hero" />
        </div>
      </section>

      <!-- ORIGINAL FEATURES BELOW -->

      <RouteMapPanel :route="selectedRoute" />

    </div>
  </div>
</template>
<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import RouteMapPanel from '../components/map/RouteMapPanel.vue'
import { useRoutes } from '../composables/useRoutes'

const {
  routes,
  selectedRoute,
  selectedRouteId,
  selectRoute
} = useRoutes()

function handleCompareAll() {
  console.log('Compare all routes', routes.value)
}
</script>

<style scoped>
.page-container {
  background: linear-gradient(180deg, #f4f7fb 0%, #eaf1f8 100%);
  min-height: 100vh;
}

.page-shell {
  background-color: transparent;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.error-text {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 236, 236, 0.95);
  color: #c34f4f;
  border: 1px solid rgba(227, 145, 145, 0.35);
}

.bike-illustration {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  font-size: 3rem;
  opacity: 0.9;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0;
  width: 100%;
  padding: 40px 0;
}

.hero-left {
  flex: 1;
}

.hero-tag {
  font-size: 12px;
  letter-spacing: 2px;
  color: #6b7a8c;
  margin-bottom: 10px;
}

.hero-left h1 {
  font-size: 64px;
  font-weight: 800;
  color: #1f2d3d;
}

.hero-left span {
  color: #2f6f4f;
}

.hero-left p {
  margin-top: 12px;
  color: #6b7a8c;
  font-size: 1.05rem;
}

.hero-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: #2f6f4f;
  color: white;
  padding: 14px 28px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

 .btn-secondary {
   background: #2f6f4f;
   color: white;
   padding: 14px 28px;
   border-radius: 10px;
   border: none;
   cursor: pointer;
   font-size: 16px;
   transition: transform 0.2s ease, background 0.2s ease;
 }

 .btn-secondary:hover {
   transform: translateY(-2px);
   background: #275c41;
 }

.hero-right img {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  transform: rotate(2deg);
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }

  .hero-right img {
    margin-top: 20px;
    width: 280px;
  }
}
</style>