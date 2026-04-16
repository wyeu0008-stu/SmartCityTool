import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/SmartCycleHomeView.vue'
import MapView from '../components/map/MapView.vue'
import SafetyInsightsView from '../views/SafetyInsightsView.vue'

const routes = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/map',
    component: MapView
  },
  {
  path: '/insights',
  component: SafetyInsightsView
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router