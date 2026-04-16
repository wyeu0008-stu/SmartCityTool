import { computed, ref } from 'vue'
import { mockRouteOptions } from '../data/mockRoutes'
import { fetchRoutes } from '../services/routeService'


export function useRoutes() {
  const currentLocation = ref('')
  const destination = ref('')
  const routes = ref(mockRouteOptions)
  const loading = ref(false)
  const error = ref('')
  const selectedRouteId = ref(mockRouteOptions[0]?.id ?? null)

  const recommendedRoute = computed(() => {
    return routes.value[0] || null
  })

  const selectedRoute = computed(() => {
    return routes.value.find((route) => route.id === selectedRouteId.value) || recommendedRoute.value
  })

  async function loadRoutes() {
    loading.value = true
    error.value = ''

    try {
      const data = await fetchRoutes({
        origin: currentLocation.value,
        destination: destination.value
      })

      routes.value = data.routes || []
      selectedRouteId.value = data.recommended?.id || data.routes?.[0]?.id || null
    } catch (err) {
      error.value = err.message || 'Failed to load routes.'
    } finally {
      loading.value = false
    }
  }

  function selectRoute(route) {
    selectedRouteId.value = route.id
  }

  return {
    currentLocation,
    destination,
    routes,
    loading,
    error,
    recommendedRoute,
    selectedRoute,
    selectedRouteId,
    loadRoutes,
    selectRoute
  }
}