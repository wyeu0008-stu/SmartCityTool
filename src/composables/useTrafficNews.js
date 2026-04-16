import { ref, onMounted } from 'vue'
import { fetchTrafficNews } from '../services/newsService'

export function useTrafficNews() {
  const news = ref([])
  const loading = ref(false)
  const error = ref('')

  async function loadNews() {
    loading.value = true
    error.value = ''

    try {
      news.value = await fetchTrafficNews()
    } catch (err) {
      error.value = err.message || 'Failed to load news'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadNews)

  return {
    news,
    loading,
    error,
    loadNews
  }
}