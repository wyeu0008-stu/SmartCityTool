import DevEnvironmentPage from './pages/DevEnvironmentPage.vue'

const protectedRoute = {
  requiresPassword: true,
  passwordScope: 'dev'
}

export const devRoutes = [
  {
    path: '/dev',
    component: DevEnvironmentPage,
    meta: protectedRoute
  },
  {
    path: '/devenv',
    redirect: '/dev'
  }
]
