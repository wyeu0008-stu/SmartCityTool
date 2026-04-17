import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useTrafficNews } from '../useTrafficNews'
import { fetchTrafficNews } from '../../services/newsService'

vi.mock('../../services/newsService', () => ({
  fetchTrafficNews: vi.fn()
}))

describe('useTrafficNews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns correct initial state', () => {
    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useTrafficNews()
        return () => null
      }
    })

    mount(TestComponent)

    expect(composable.news.value).toEqual([])
    expect(composable.loading.value).toBe(true)
    expect(composable.error.value).toBe('')
  })

  it('loads news successfully', async () => {
    const mockNews = [
      {
        title: 'Traffic accident in Melbourne',
        url: 'https://example.com/1'
      },
      {
        title: 'New cycling policy released',
        url: 'https://example.com/2'
      }
    ]

    fetchTrafficNews.mockResolvedValue(mockNews)

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useTrafficNews()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    expect(fetchTrafficNews).toHaveBeenCalled()
    expect(composable.news.value).toEqual(mockNews)
    expect(composable.error.value).toBe('')
    expect(composable.loading.value).toBe(false)
  })

  it('sets error when loading news fails', async () => {
    fetchTrafficNews.mockRejectedValue(new Error('Network error'))

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useTrafficNews()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    expect(fetchTrafficNews).toHaveBeenCalled()
    expect(composable.news.value).toEqual([])
    expect(composable.error.value).toBe('Network error')
    expect(composable.loading.value).toBe(false)
  })

  it('uses fallback error message when error has no message', async () => {
    fetchTrafficNews.mockRejectedValue({})

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useTrafficNews()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    expect(composable.error.value).toBe('Failed to load news')
    expect(composable.loading.value).toBe(false)
  })

  it('loadNews can be called manually', async () => {
    const mockNews = [
      { title: 'Traffic update', url: 'https://example.com/3' }
    ]

    fetchTrafficNews.mockResolvedValue(mockNews)

    let composable

    const TestComponent = defineComponent({
      setup() {
        composable = useTrafficNews()
        return () => null
      }
    })

    mount(TestComponent)

    await Promise.resolve()
    await Promise.resolve()

    fetchTrafficNews.mockClear()

    await composable.loadNews()

    expect(fetchTrafficNews).toHaveBeenCalledTimes(1)
    expect(composable.news.value).toEqual(mockNews)
    expect(composable.loading.value).toBe(false)
  })
})