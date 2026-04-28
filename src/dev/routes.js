import DevHomePage from './pages/DevHomePage.vue'
import DevMapPage from './pages/DevMapPage.vue'
import DevInsightsPage from './pages/DevInsightsPage.vue'

const protectedRoute = {
  requiresPassword: true,
  passwordScope: 'dev'
}

export const devRoutes = [
  {
    path: '/dev',
    component: DevHomePage,
    meta: protectedRoute
  },
  {
    path: '/dev/map',
    component: DevMapPage,
    alias: '/dev/routes',
    meta: protectedRoute
  },
  {
    path: '/dev/insights',
    component: DevInsightsPage,
    meta: protectedRoute
  },
  {
    path: '/devenv',
    redirect: '/dev'
  }
]
