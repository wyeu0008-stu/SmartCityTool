import DevHomePage from './pages/DevHomePage.vue'
import DevMapPage from './pages/DevMapPage.vue'
import DevInsightsPage from './pages/DevInsightsPage.vue'
import DevMoreInfoPage from './pages/DevMoreInfoPage.vue'

const protectedRoute = {
  requiresPassword: true,
  passwordScope: 'dev'
}

export const devRoutes = [
  {
    path: '/dev',
    component: DevHomePage,
    alias: '/dev/home',
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
    alias: '/dev/safety-insights',
    meta: protectedRoute
  },
  {
    path: '/dev/more-info',
    component: DevMoreInfoPage,
    alias: '/dev/moreinfo',
    meta: protectedRoute
  },
  {
    path: '/devenv',
    redirect: '/dev'
  }
]
