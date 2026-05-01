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
    redirect: '/dev/home',
    meta: protectedRoute
  },
  {
    path: '/dev/home',
    component: DevHomePage,
    meta: protectedRoute
  },
  {
    path: '/dev/map',
    component: DevMapPage,
    meta: protectedRoute
  },
  {
    path: '/dev/safety-insights',
    component: DevInsightsPage,
    meta: protectedRoute
  },
  {
    path: '/devenv',
    redirect: '/dev/home'
  }
]
