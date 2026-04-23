import { createRouter, createWebHistory } from 'vue-router'
import { hasPasswordAccess } from '../auth/passwordAccess'
import { releaseRoutes } from '../Release/routes'
import { oldVersionRoutes } from '../oldver/routes'
import { devRoutes } from '../dev/routes'
import PasswordGateView from '../views/PasswordGateView.vue'

const authRoutes = [
  {
    path: '/auth/:target(oldver|dev)',
    name: 'password-gate',
    component: PasswordGateView,
    props: (route) => ({
      target: route.params.target,
      redirectTo: route.query.redirect || `/${route.params.target}`
    })
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...releaseRoutes,
    ...oldVersionRoutes,
    ...devRoutes,
    ...authRoutes
  ]
})

router.beforeEach((to) => {
  if (!to.meta.requiresPassword) {
    return true
  }

  const scope = to.meta.passwordScope

  if (hasPasswordAccess(scope)) {
    return true
  }

  return {
    name: 'password-gate',
    params: { target: scope },
    query: { redirect: to.fullPath }
  }
})

export default router
