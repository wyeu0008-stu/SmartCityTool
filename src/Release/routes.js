import ReleaseHomePage from './pages/ReleaseHomePage.vue'
import ReleaseMapPage from './pages/ReleaseMapPage.vue'
import ReleaseInsightsPage from './pages/ReleaseInsightsPage.vue'

export const releaseRoutes = [
  {
    path: '/',
    component: ReleaseHomePage
  },
  {
    path: '/map',
    component: ReleaseMapPage,
    alias: '/routes'
  },
  {
    path: '/insights',
    component: ReleaseInsightsPage
  }
]
