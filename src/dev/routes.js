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
<<<<<<< HEAD
    redirect: '/dev/home',
    meta: protectedRoute
  },
  {
    path: '/dev/home',
=======
>>>>>>> origin/main
    component: DevHomePage,
    meta: protectedRoute
  },
  {
    path: '/dev/map',
    component: DevMapPage,
<<<<<<< HEAD
    meta: protectedRoute
  },
  {
    path: '/dev/safety-insights',
=======
    alias: '/dev/routes',
    meta: protectedRoute
  },
  {
    path: '/dev/insights',
>>>>>>> origin/main
    component: DevInsightsPage,
    meta: protectedRoute
  },
  {
    path: '/devenv',
    redirect: '/dev/home'
  }
]
