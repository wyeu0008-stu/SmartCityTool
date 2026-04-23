import OldVersionHomePage from './pages/OldVersionHomePage.vue'
import OldVersionMapPage from './pages/OldVersionMapPage.vue'
import OldVersionInsightsPage from './pages/OldVersionInsightsPage.vue'

const protectedRoute = {
  requiresPassword: true,
  passwordScope: 'oldver'
}

export const oldVersionRoutes = [
  {
    path: '/oldver',
    component: OldVersionHomePage,
    meta: protectedRoute
  },
  {
    path: '/oldver/map',
    component: OldVersionMapPage,
    alias: '/oldver/routes',
    meta: protectedRoute
  },
  {
    path: '/oldver/insights',
    component: OldVersionInsightsPage,
    meta: protectedRoute
  }
]
