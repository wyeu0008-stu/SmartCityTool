import { ref, onMounted } from 'vue'
import { fetchCurrentWeather } from '../services/weatherService'

export function useWeather() {
  const weather = ref({})
  const loading = ref(false)
  const error = ref('')

  async function loadWeather() {
    loading.value = true
    error.value = ''

    try {
      weather.value = await fetchCurrentWeather()
    } catch (err) {
      error.value = err.message || 'Failed to load weather'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadWeather)

  return {
    weather,
    loading,
    error,
    loadWeather
  }
}